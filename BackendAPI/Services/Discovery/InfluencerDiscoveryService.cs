using BackendAPI.Data;
using BackendAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Services.Discovery
{
    public class InfluencerDiscoveryService : IInfluencerDiscoveryService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IInstagramService _instagramService;
        private readonly BotScoreCalculator _botScoreCalculator;
        private readonly ILogger<InfluencerDiscoveryService> _logger;

        private static readonly TimeSpan ThrottleDelay = TimeSpan.FromSeconds(1);

        public InfluencerDiscoveryService(
            IServiceScopeFactory scopeFactory,
            IInstagramService instagramService,
            BotScoreCalculator botScoreCalculator,
            ILogger<InfluencerDiscoveryService> logger)
        {
            _scopeFactory = scopeFactory;
            _instagramService = instagramService;
            _botScoreCalculator = botScoreCalculator;
            _logger = logger;
        }

        public async Task RunDiscoveryAsync(CancellationToken ct)
        {
            _logger.LogInformation("Starting discovery cycle");

            List<string> seedHandles;
            using (var scope = _scopeFactory.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                seedHandles = await ctx.Influencers
                    .Where(i => i.RefreshPriority == InfluencerThresholds.PriorityHigh
                                && !string.IsNullOrEmpty(i.InstagramHandle))
                    .Select(i => i.InstagramHandle!)
                    .ToListAsync(ct);
            }

            _logger.LogInformation("Discovery: {Count} seed influencers", seedHandles.Count);

            int discovered = 0;
            foreach (var handle in seedHandles)
            {
                if (ct.IsCancellationRequested) break;
                try
                {
                    var similar = await _instagramService.GetSimilarUsersAsync(handle);
                    foreach (var candidate in similar)
                    {
                        if (ct.IsCancellationRequested) break;
                        if (await TryIngestAsync(candidate, handle, ct)) discovered++;
                        await Task.Delay(ThrottleDelay, ct);
                    }

                    var tagged = await _instagramService.GetTaggedUsersAsync(handle);
                    foreach (var candidate in tagged)
                    {
                        if (ct.IsCancellationRequested) break;
                        if (await TryIngestAsync(candidate, handle, ct)) discovered++;
                        await Task.Delay(ThrottleDelay, ct);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Discovery error for @{Handle}", handle);
                }
                await Task.Delay(ThrottleDelay, ct);
            }

            _logger.LogInformation("Discovery complete. {Count} new influencers added", discovered);
        }

        // Required by IInfluencerDiscoveryService — delegates to RunDiscoveryAsync
        public async Task<List<string>> DiscoverFromHashtagAsync(string hashtag, CancellationToken ct)
        {
            // Hashtag discovery not available via public scraper
            // Use graph expansion instead
            _logger.LogInformation("Hashtag discovery skipped — using graph expansion");
            return new List<string>();
        }

        public async Task IngestAccountAsync(string username, Guid? discoveredFromId, CancellationToken ct)
        {
            await TryIngestAsync(username, "", ct);
        }

        private async Task<bool> TryIngestAsync(
            string username,
            string discoveredFromHandle,
            CancellationToken ct)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var clean = username.TrimStart('@').ToLower();

                var exists = await ctx.Influencers
                    .AnyAsync(i => i.InstagramHandle == "@" + clean ||
                                   i.DisplayName == clean, ct);
                if (exists) return false;

                var profile = await _instagramService.GetPublicProfileAsync(clean);
                if (profile == null) return false;

                if (profile.FollowersCount < InfluencerThresholds.MinFollowers)
                    return false;

                var media = await _instagramService.GetMediaAsync(clean);
                await Task.Delay(500, ct);

                decimal engagementRate = 0;
                if (media.Any() && profile.FollowersCount > 0)
                {
                    var totalEng = media.Take(10).Sum(m => m.LikeCount + m.CommentsCount);
                    engagementRate = Math.Round(
                        (decimal)totalEng / Math.Min(media.Count, 10) / profile.FollowersCount * 100, 2);
                }

                var botScore = _botScoreCalculator.Calculate(
                    followerCount: profile.FollowersCount,
                    followingCount: profile.FollowsCount,
                    engagementRate: engagementRate,
                    postCount: profile.MediaCount,
                    accountAgeDays: 365,
                    previousFollowerCount: null);

                var seedInfluencer = string.IsNullOrEmpty(discoveredFromHandle) ? null :
                    await ctx.Influencers.FirstOrDefaultAsync(
                        i => i.InstagramHandle == "@" + discoveredFromHandle.TrimStart('@'), ct);

                var newInfluencer = new Influencer
                {
                    Name = profile.Name ?? profile.Username,
                    DisplayName = profile.Username,
                    Platform = "Instagram",
                    InstagramHandle = "@" + clean,
                    FollowerCount = profile.FollowersCount,
                    EngagementRate = engagementRate,
                    BotScore = botScore,
                    NicheId = seedInfluencer?.NicheId ?? 1,
                    MarketId = seedInfluencer?.MarketId ?? 1,
                    RefreshPriority = InfluencerThresholds.PriorityLow,
                    IsVerified = profile.IsVerified,
                    DiscoverySource = "GraphExpansion",
                    DiscoveredFromInfluencerId = seedInfluencer?.Id,
                    LastDataRefresh = DateTime.UtcNow,
                    NextRefreshDue = DateTime.UtcNow.AddHours(InfluencerThresholds.LowPriorityRefreshHours),
                    Email = $"{clean}@placeholder.com"
                };

                ctx.Influencers.Add(newInfluencer);
                await ctx.SaveChangesAsync(ct);

                _logger.LogInformation("✓ Discovered @{Username} ({Followers} followers)",
                    clean, profile.FollowersCount);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ingest failed for @{Username}", username);
                return false;
            }
        }
    }
}
