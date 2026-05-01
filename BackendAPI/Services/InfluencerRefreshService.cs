using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Services.Discovery;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Services
{
    public class InfluencerRefreshService : IInfluencerRefreshService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IInstagramService _instagramService;
        private readonly BotScoreCalculator _botScoreCalculator;
        private readonly ILogger<InfluencerRefreshService> _logger;

        private static readonly TimeSpan ThrottleDelay = TimeSpan.FromMilliseconds(500);

        public InfluencerRefreshService(
            IServiceScopeFactory scopeFactory,
            IInstagramService instagramService,
            BotScoreCalculator botScoreCalculator,
            ILogger<InfluencerRefreshService> logger)
        {
            _scopeFactory = scopeFactory;
            _instagramService = instagramService;
            _botScoreCalculator = botScoreCalculator;
            _logger = logger;
        }

        // Refresh all influencers due for a refresh at the given priority tier
        public async Task RefreshByPriorityAsync(string priority, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting {Priority} priority refresh", priority);

            List<Guid> ids;
            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                ids = await context.Influencers
                    .Where(i => i.RefreshPriority == priority &&
                                i.NextRefreshDue <= DateTime.UtcNow)
                    .Select(i => i.Id)
                    .ToListAsync(cancellationToken);
            }

            _logger.LogInformation("{Priority} priority: {Count} influencers due for refresh",
                priority, ids.Count);

            int success = 0, failed = 0;

            foreach (var id in ids)
            {
                if (cancellationToken.IsCancellationRequested) break;

                try
                {
                    await RefreshInfluencerAsync(id, cancellationToken);
                    success++;
                }
                catch (Exception ex)
                {
                    failed++;
                    _logger.LogError(ex, "Failed to refresh influencer {Id}", id);
                }

                await Task.Delay(ThrottleDelay, cancellationToken);
            }

            _logger.LogInformation("{Priority} refresh done. Success: {S}, Failed: {F}",
                priority, success, failed);
        }

        public async Task RefreshAllAsync(CancellationToken cancellationToken)
        {
            List<Guid> ids;
            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                ids = await context.Influencers.Select(i => i.Id).ToListAsync(cancellationToken);
            }

            _logger.LogInformation("Starting full refresh for {Count} influencers", ids.Count);

            foreach (var id in ids)
            {
                if (cancellationToken.IsCancellationRequested) break;
                try { await RefreshInfluencerAsync(id, cancellationToken); }
                catch (Exception ex) { _logger.LogError(ex, "Failed to refresh {Id}", id); }
                await Task.Delay(ThrottleDelay, cancellationToken);
            }
        }

        public async Task RefreshInfluencerAsync(Guid influencerId, CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var influencer = await context.Influencers.FindAsync(
                new object[] { influencerId }, cancellationToken);

            if (influencer == null) return;

            var previousSnapshot = await context.MetricSnapshots
                .Where(ms => ms.InfluencerId == influencerId)
                .OrderByDescending(ms => ms.SnapshotDate)
                .FirstOrDefaultAsync(cancellationToken);

            decimal? previousFollowerCount = previousSnapshot?.FollowerCount;

            bool refreshedFromApi = false;

            if (!string.IsNullOrEmpty(influencer.InstagramHandle))
            {
                try
                {
                    refreshedFromApi = await RefreshFromInstagramAsync(
                        influencer, context, previousFollowerCount, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Instagram refresh failed for {DisplayName} — using fallback",
                        influencer.DisplayName);
                }
            }

            if (!refreshedFromApi)
            {
                var botScore = _botScoreCalculator.Calculate(
                    followerCount: influencer.FollowerCount,
                    followingCount: 0,
                    engagementRate: influencer.EngagementRate,
                    postCount: 0,
                    accountAgeDays: 365,
                    previousFollowerCount: previousFollowerCount);

                influencer.BotScore = botScore;
                influencer.LastDataRefresh = DateTime.UtcNow;
                influencer.NextRefreshDue = GetNextRefreshTime(influencer.RefreshPriority);

                context.MetricSnapshots.Add(new MetricSnapshot
                {
                    InfluencerId = influencer.Id,
                    FollowerCount = influencer.FollowerCount,
                    EngagementRate = influencer.EngagementRate,
                    AverageReach = 0,
                    BotScore = botScore,
                    SnapshotDate = DateTime.UtcNow
                });

                await context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Fallback refresh complete for {DisplayName} — BotScore: {BotScore}",
                    influencer.DisplayName, botScore);
            }
        }

        public async Task PromoteToHighPriorityAsync(Guid influencerId)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var influencer = await context.Influencers.FindAsync(influencerId);
            if (influencer == null) return;

            if (influencer.RefreshPriority != InfluencerThresholds.PriorityHigh)
            {
                influencer.RefreshPriority = InfluencerThresholds.PriorityHigh;
                influencer.NextRefreshDue = DateTime.UtcNow.AddHours(
                    InfluencerThresholds.HighPriorityRefreshHours);

                await context.SaveChangesAsync();

                _logger.LogInformation("Promoted {DisplayName} to high priority",
                    influencer.DisplayName);
            }
        }

        private async Task<bool> RefreshFromInstagramAsync(
            Influencer influencer,
            ApplicationDbContext context,
            decimal? previousFollowerCount,
            CancellationToken cancellationToken)
        {
            var handle = influencer.InstagramHandle?.TrimStart('@');
            if (string.IsNullOrEmpty(handle)) return false;

            var profile = await _instagramService.GetProfileAsync(handle);
            if (profile == null) return false;

            var media = await _instagramService.GetMediaAsync(handle);
            decimal avgEngagement = 0;

            if (media != null && media.Count > 0 && profile.FollowersCount > 0)
            {
                var recent = media.Take(10).ToList();
                var totalEngagement = recent.Sum(m => m.LikeCount + m.CommentsCount);
                avgEngagement = Math.Round(
                    (decimal)totalEngagement / recent.Count / profile.FollowersCount * 100, 2);
            }

            var botScore = _botScoreCalculator.Calculate(
                followerCount: profile.FollowersCount,
                followingCount: profile.FollowsCount,
                engagementRate: avgEngagement > 0 ? avgEngagement : influencer.EngagementRate,
                postCount: profile.MediaCount,
                accountAgeDays: 365,
                previousFollowerCount: previousFollowerCount);

            influencer.FollowerCount = profile.FollowersCount;
            influencer.EngagementRate = avgEngagement > 0 ? avgEngagement : influencer.EngagementRate;
            influencer.BotScore = botScore;
            influencer.LastDataRefresh = DateTime.UtcNow;
            influencer.NextRefreshDue = GetNextRefreshTime(influencer.RefreshPriority);

            context.MetricSnapshots.Add(new MetricSnapshot
            {
                InfluencerId = influencer.Id,
                FollowerCount = profile.FollowersCount,
                EngagementRate = avgEngagement > 0 ? avgEngagement : influencer.EngagementRate,
                AverageReach = 0,
                BotScore = botScore,
                SnapshotDate = DateTime.UtcNow
            });

            await context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Instagram refresh complete for {DisplayName} — Followers: {F}, Engagement: {E}%, BotScore: {B}",
                influencer.DisplayName, profile.FollowersCount, avgEngagement, botScore);

            return true;
        }

        private DateTime GetNextRefreshTime(string priority)
        {
            return priority == InfluencerThresholds.PriorityHigh
                ? DateTime.UtcNow.AddHours(InfluencerThresholds.HighPriorityRefreshHours)
                : DateTime.UtcNow.AddHours(InfluencerThresholds.LowPriorityRefreshHours);
        }
    }
}
