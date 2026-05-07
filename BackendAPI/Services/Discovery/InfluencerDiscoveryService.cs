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

        public async Task<List<DiscoveredAccount>> MineHashtagsAsync(
            string niche,
            List<string> hashtags,
            CancellationToken ct)
        {
            _logger.LogInformation("Hashtag mining skipped — using graph expansion for niche: {Niche}", niche);
            return new List<DiscoveredAccount>();
        }

        public async Task<List<DiscoveredAccount>> ExpandFromInfluencerAsync(
            Guid influencerId,
            CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var influencer = await ctx.Influencers.FindAsync(new object[] { influencerId }, ct);
            if (influencer == null || string.IsNullOrEmpty(influencer.InstagramHandle))
                return new List<DiscoveredAccount>();

            var handle = influencer.InstagramHandle.TrimStart('@');
            var discovered = new List<DiscoveredAccount>();

            var similar = await _instagramService.GetSimilarUsersAsync(handle);
            foreach (var username in similar)
            {
                discovered.Add(new DiscoveredAccount
                {
                    Handle = username,
                    Name = username,
                    DiscoverySource = "SimilarUsers",
                    DiscoveredFromInfluencerId = influencerId
                });
                await Task.Delay(200, ct);
            }

            var tagged = await _instagramService.GetTaggedUsersAsync(handle);
            foreach (var username in tagged)
            {
                if (!discovered.Any(d => d.Handle == username))
                    discovered.Add(new DiscoveredAccount
                    {
                        Handle = username,
                        Name = username,
                        DiscoverySource = "TaggedInPost",
                        DiscoveredFromInfluencerId = influencerId
                    });
                await Task.Delay(200, ct);
            }

            _logger.LogInformation("Expanded from @{Handle}: {Count} candidates", handle, discovered.Count);
            return discovered;
        }

        public async Task<DiscoveredAccount?> QualifyAccountAsync(
            string handle,
            CancellationToken ct)
        {
            try
            {
                var clean = handle.TrimStart('@').ToLower();
                var profile = await _instagramService.GetPublicProfileAsync(clean);
                if (profile == null) return null;

                if (profile.FollowersCount < InfluencerThresholds.MinFollowers)
                    return null;

                var media = await _instagramService.GetMediaAsync(clean);
                await Task.Delay(500, ct);

                decimal engagementRate = 0;
                if (media.Any() && profile.FollowersCount > 0)
                {
                    var totalEng = media.Take(10).Sum(m => m.LikeCount + m.CommentsCount);
                    engagementRate = Math.Round(
                        (decimal)totalEng / Math.Min(media.Count, 10) / profile.FollowersCount * 100, 2);
                }

                return new DiscoveredAccount
                {
                    Handle = clean,
                    Name = profile.Name ?? clean,
                    FollowerCount = profile.FollowersCount,
                    FollowingCount = profile.FollowsCount,
                    EngagementRate = engagementRate,
                    PostCount = profile.MediaCount,
                    DiscoverySource = "GraphExpansion"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Qualify failed for @{Handle}", handle);
                return null;
            }
        }

        public async Task<Guid?> IngestAccountAsync(
            DiscoveredAccount account,
            int nicheId,
            int marketId,
            CancellationToken ct)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var clean = account.Handle.TrimStart('@').ToLower();

                var exists = await ctx.Influencers
                    .AnyAsync(i => i.InstagramHandle == "@" + clean ||
                                   i.DisplayName == clean, ct);
                if (exists) return null;

                var botScore = _botScoreCalculator.Calculate(
                    followerCount: account.FollowerCount,
                    followingCount: account.FollowingCount,
                    engagementRate: account.EngagementRate,
                    postCount: account.PostCount,
                    accountAgeDays: 365,
                    previousFollowerCount: null);

                var influencer = new Influencer
                {
                    Name = account.Name ?? clean,
                    DisplayName = clean,
                    Platform = account.Platform,
                    InstagramHandle = "@" + clean,
                    FollowerCount = account.FollowerCount,
                    EngagementRate = account.EngagementRate,
                    BotScore = botScore,
                    NicheId = nicheId,
                    MarketId = marketId,
                    RefreshPriority = InfluencerThresholds.PriorityLow,
                    IsVerified = false,
                    DiscoverySource = account.DiscoverySource ?? "GraphExpansion",
                    DiscoveredFromInfluencerId = account.DiscoveredFromInfluencerId,
                    LastDataRefresh = DateTime.UtcNow,
                    NextRefreshDue = DateTime.UtcNow.AddHours(InfluencerThresholds.LowPriorityRefreshHours),
                    Email = $"{clean}@placeholder.com"
                };

                ctx.Influencers.Add(influencer);
                await ctx.SaveChangesAsync(ct);

                _logger.LogInformation("✓ Ingested @{Handle} ({Followers} followers)",
                    clean, account.FollowerCount);

                return influencer.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ingest failed for @{Handle}", account.Handle);
                return null;
            }
        }

        public async Task RunDiscoveryCycleAsync(CancellationToken ct)
        {
            _logger.LogInformation("Starting full discovery cycle");

            List<Influencer> seeds;
            using (var scope = _scopeFactory.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                seeds = await ctx.Influencers
                    .Where(i => i.RefreshPriority == InfluencerThresholds.PriorityHigh
                                && !string.IsNullOrEmpty(i.InstagramHandle))
                    .ToListAsync(ct);
            }

            _logger.LogInformation("Discovery: {Count} seed influencers", seeds.Count);

            int discovered = 0;
            foreach (var seed in seeds)
            {
                if (ct.IsCancellationRequested) break;
                try
                {
                    var candidates = await ExpandFromInfluencerAsync(seed.Id, ct);
                    foreach (var candidate in candidates)
                    {
                        if (ct.IsCancellationRequested) break;
                        var qualified = await QualifyAccountAsync(candidate.Handle, ct);
                        if (qualified == null) continue;
                        qualified.DiscoveredFromInfluencerId = seed.Id;
                        var id = await IngestAccountAsync(qualified, seed.NicheId, seed.MarketId, ct);
                        if (id.HasValue) discovered++;
                        await Task.Delay(ThrottleDelay, ct);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Discovery error for seed {Id}", seed.Id);
                }
                await Task.Delay(ThrottleDelay, ct);
            }

            _logger.LogInformation("Discovery cycle complete. {Count} new influencers added", discovered);
        }
    }
}
