using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Services.Discovery;
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
                    // Graph expansion via Similar Users
                    var similar = await _instagramService.GetSimilarUsersAsync(handle);
                    _logger.LogInformation("@{Handle}: {Count} similar users found", handle, similar.Count);

                    foreach (var candidate in similar)
                    {
                        if (ct.IsCancellationRequested) break;
                        if (await TryIngestAsync(candidate, handle, ct))
                            discovered++;
                        await Task.Delay(ThrottleDelay, ct);
                    }

                    // Graph expansion via tagged users in posts
                    var tagged = await _instagramService.GetTaggedUsersAsync(handle);
                    _logger.LogInformation("@{Handle}: {Count} tagged users found", handle, tagged.Count);

                    foreach (var candidate in tagged)
                    {
                        if (ct.IsCancellationRequested) break;
                        if (await TryIngestAsync(candidate, handle, ct))
                            discovered++;
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

                // Skip if already in database
                var exists = await ctx.Influencers
                    .AnyAsync(i => i.InstagramHandle == "@" + clean ||
                                   i.DisplayName == clean, ct);
                if (exists) return false;

                // Fetch profile to qualify
                var profile = await _instagramService.GetPublicProfileAsync(clean);
                if (profile == null) return false;

                // Qualify — must have at least 1,000 followers
                if (profile.FollowersCount < InfluencerThresholds.MinFollowers)
                {
                    _logger.LogDebug("@{Username} below threshold ({Count} followers)",
                        clean, profile.FollowersCount);
                    return false;
                }

                // Get media for engagement calculation
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

                // Find the seed influencer
                var seedInfluencer = await ctx.Influencers
                    .FirstOrDefaultAsync(i => i.InstagramHandle == "@" + discoveredFromHandle.TrimStart('@'), ct);

                // Get default niche/market from seed or use defaults
                int nicheId = seedInfluencer?.NicheId ?? 1;
                int marketId = seedInfluencer?.MarketId ?? 1;

                var newInfluencer = new Influencer
                {
                    Name = profile.Name ?? profile.Username,
                    DisplayName = profile.Username,
                    Platform = "Instagram",
                    InstagramHandle = "@" + clean,
                    FollowerCount = profile.FollowersCount,
                    EngagementRate = engagementRate,
                    BotScore = botScore,
                    NicheId = nicheId,
                    MarketId = marketId,
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
