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

        private static readonly TimeSpan ThrottleDelay = TimeSpan.FromSeconds(2);

        // Seed SA brand accounts mapped to niche IDs
        private static readonly Dictionary<string, int> SaBrandAccountNiches = new()
        {
            { "woolworths_sa", 2 }, { "woolworths_food", 3 }, { "nandossa", 3 },
            { "checkers_sa", 3 }, { "disneyplussouthafrica", 7 }, { "puma_za", 1 },
            { "adidasza", 1 }, { "nikesouthafrica", 1 }, { "showmax", 7 },
            { "discoverysa", 9 }, { "standardbankza", 9 }, { "fnbsouthafrica", 9 },
            { "nedbank", 9 }, { "mtnza", 5 }, { "vodacomsa", 5 }, { "telkomsa", 5 },
            { "multichoiceza", 7 }, { "superbalistsa", 2 }, { "mrpricesa", 2 },
            { "cottonon_za", 2 }, { "spur_sa", 3 }, { "steers_sa", 3 },
            { "kfcsouthafrica", 3 }, { "discoverysport", 1 }, { "capitecbank", 9 },
            { "absasouthafrica", 9 },
        };

        // Brand category keywords from Instagram
        private static readonly HashSet<string> BrandCategoryKeywords = new(StringComparer.OrdinalIgnoreCase)
        {
            "retail", "shopping", "brand", "company", "organization", "organisation",
            "media", "news", "sports", "government", "restaurant", "food service",
            "automotive", "finance", "bank", "insurance", "telecom", "airline",
            "hotel", "travel agency", "software", "product", "service",
            "clothing", "cosmetics", "beauty supply", "grocery", "supermarket",
            "sport", "football", "cricket", "rugby", "soccer"
        };

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

        // ── Brand detection ───────────────────────────────────────────────
        private bool IsBrandAccount(InstagramProfile profile)
        {
            // Check Instagram category name
            if (!string.IsNullOrEmpty(profile.CategoryName))
            {
                foreach (var keyword in BrandCategoryKeywords)
                    if (profile.CategoryName.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                    {
                        _logger.LogDebug("@{Username} rejected — brand category: {Category}",
                            profile.Username, profile.CategoryName);
                        return true;
                    }
            }

            // Business account with very low following ratio = brand
            if (profile.IsBusinessAccount && profile.FollowersCount > 10000
                && profile.FollowsCount < 200)
                return true;

            // Brand username patterns with high followers
            var brandSuffixes = new[] { "_sa", "_za", "_official", "_store", "_shop",
                                        "_fc", "_sports", "_football", "_cricket" };
            foreach (var suffix in brandSuffixes)
                if ((profile.Username.EndsWith(suffix) || profile.Username.StartsWith(suffix.TrimStart('_')))
                    && profile.IsBusinessAccount
                    && profile.FollowersCount > 20000)
                    return true;

            return false;
        }

        // ── Interface methods ─────────────────────────────────────────────
        public async Task<List<DiscoveredAccount>> MineHashtagsAsync(
            string niche, List<string> hashtags, CancellationToken ct)
        {
            _logger.LogInformation("Hashtag mining skipped — using brand account strategy");
            return new List<DiscoveredAccount>();
        }

        public async Task<List<DiscoveredAccount>> ExpandFromInfluencerAsync(
            Guid influencerId, CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var influencer = await ctx.Influencers.FindAsync(new object[] { influencerId }, ct);
            if (influencer == null || string.IsNullOrEmpty(influencer.InstagramHandle))
                return new List<DiscoveredAccount>();

            var handle = influencer.InstagramHandle.TrimStart('@');
            var tagged = await _instagramService.GetTaggedUsersAsync(handle);
            var discovered = tagged.Select(u => new DiscoveredAccount
            {
                Handle = u, Name = u,
                DiscoverySource = "TaggedInPost",
                DiscoveredFromInfluencerId = influencerId
            }).ToList();

            _logger.LogInformation("Expanded from @{Handle}: {Count} candidates", handle, discovered.Count);
            return discovered;
        }

        public async Task<DiscoveredAccount?> QualifyAccountAsync(
            string handle, CancellationToken ct)
        {
            try
            {
                var clean = handle.TrimStart('@').ToLower();
                var profile = await _instagramService.GetPublicProfileAsync(clean);
                if (profile == null) return null;

                // Reject brand accounts using smart detection
                if (IsBrandAccount(profile))
                {
                    _logger.LogInformation("Skipping brand @{Handle} (category: {Category}, business: {IsBusiness})",
                        clean, profile.CategoryName, profile.IsBusinessAccount);
                    return null;
                }

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
            DiscoveredAccount account, int nicheId, int marketId, CancellationToken ct)
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
                await ctx.SaveChangesAsync(CancellationToken.None);

                _logger.LogInformation("✓ Ingested @{Handle} ({Followers} followers, niche {NicheId})",
                    clean, account.FollowerCount, nicheId);

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
            _logger.LogInformation("Starting discovery cycle");
            int discovered = 0;

            // ── Step 1: Mine hardcoded SA brand accounts ──────────────────
            foreach (var brandEntry in SaBrandAccountNiches)
            {
                if (ct.IsCancellationRequested) break;
                var brandHandle = brandEntry.Key;
                var nicheId = brandEntry.Value;

                try
                {
                    _logger.LogInformation("Mining brand @{Brand}", brandHandle);
                    var tagged = await _instagramService.GetTaggedUsersAsync(brandHandle);
                    _logger.LogInformation("@{Brand}: {Count} tagged users", brandHandle, tagged.Count);

                    foreach (var candidate in tagged)
                    {
                        if (ct.IsCancellationRequested) break;
                        var qualified = await QualifyAccountAsync(candidate, ct);
                        if (qualified == null) continue;
                        var id = await IngestAccountAsync(qualified, nicheId, 1, ct);
                        if (id.HasValue) discovered++;
                        await Task.Delay(ThrottleDelay, ct);
                    }
                }
                catch (Exception ex) { _logger.LogError(ex, "Error mining @{Brand}", brandHandle); }
                await Task.Delay(ThrottleDelay, ct);
            }

            // ── Step 2: Mine ALL influencers in database for dynamic brands ─
            List<Influencer> allInfluencers;
            using (var scope = _scopeFactory.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                allInfluencers = await ctx.Influencers
                    .Where(i => !string.IsNullOrEmpty(i.InstagramHandle))
                    .ToListAsync(ct);
            }

            _logger.LogInformation("Dynamic expansion from {Count} influencers", allInfluencers.Count);

            var dynamicBrands = new Dictionary<string, int>();

            foreach (var influencer in allInfluencers)
            {
                if (ct.IsCancellationRequested) break;
                var handle = influencer.InstagramHandle!.TrimStart('@');

                try
                {
                    var tagged = await _instagramService.GetTaggedUsersAsync(handle);
                    foreach (var taggedHandle in tagged)
                    {
                        if (dynamicBrands.ContainsKey(taggedHandle)) continue;

                        var profile = await _instagramService.GetPublicProfileAsync(taggedHandle);
                        if (profile == null) continue;
                        await Task.Delay(500, ct);

                        if (profile.IsBusinessAccount && profile.FollowersCount > 10000)
                        {
                            dynamicBrands[taggedHandle] = influencer.NicheId;
                            _logger.LogInformation("Found brand @{Brand} (category: {Cat}) from @{Influencer}",
                                taggedHandle, profile.CategoryName, handle);
                        }
                        else
                        {
                            // It's a person — try to qualify and ingest directly
                            var qualified = await QualifyAccountAsync(taggedHandle, ct);
                            if (qualified != null)
                            {
                                qualified.DiscoveredFromInfluencerId = influencer.Id;
                                var id = await IngestAccountAsync(qualified, influencer.NicheId, influencer.MarketId, ct);
                                if (id.HasValue) discovered++;
                            }
                        }
                        await Task.Delay(ThrottleDelay, ct);
                    }
                }
                catch (Exception ex) { _logger.LogError(ex, "Expansion error for @{Handle}", handle); }
                await Task.Delay(ThrottleDelay, ct);
            }

            // ── Step 3: Mine dynamically discovered brands ────────────────
            _logger.LogInformation("Mining {Count} dynamically discovered brands", dynamicBrands.Count);

            foreach (var brandEntry in dynamicBrands)
            {
                if (ct.IsCancellationRequested) break;
                try
                {
                    var tagged = await _instagramService.GetTaggedUsersAsync(brandEntry.Key);
                    foreach (var candidate in tagged)
                    {
                        if (ct.IsCancellationRequested) break;
                        var qualified = await QualifyAccountAsync(candidate, ct);
                        if (qualified == null) continue;
                        var id = await IngestAccountAsync(qualified, brandEntry.Value, 1, ct);
                        if (id.HasValue) discovered++;
                        await Task.Delay(ThrottleDelay, ct);
                    }
                }
                catch (Exception ex) { _logger.LogError(ex, "Error mining dynamic brand @{Brand}", brandEntry.Key); }
                await Task.Delay(ThrottleDelay, ct);
            }

            _logger.LogInformation("Discovery complete. {Count} new influencers added", discovered);
        }
    }
}
