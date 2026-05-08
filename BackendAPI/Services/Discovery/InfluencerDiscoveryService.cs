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
            { "woolworths_sa", 2 }, { "nandossa", 3 }, { "checkers_sa", 3 },
            { "disneyplussouthafrica", 7 }, { "puma_za", 1 }, { "nikesouthafrica", 1 },
            { "showmax", 7 }, { "discoverysa", 9 }, { "standardbankza", 9 },
            { "fnbsouthafrica", 9 }, { "mtnza", 5 }, { "vodacomsa", 5 },
            { "multichoiceza", 7 }, { "superbalistsa", 2 }, { "mrpricesa", 2 },
            { "cottonon_za", 2 }, { "discoverysport", 1 }, { "absasouthafrica", 9 },
        };

        // Permanent blocklist — handles that should NEVER be ingested
        private static readonly HashSet<string> PermanentBlocklist = new(StringComparer.OrdinalIgnoreCase)
        {
            // Global sports brands
            "adidas","adidasza","adidasfootball","adidasoriginals","adidasrunning",
            "nike","nikesouthafrica","puma","puma_za","pumatraining","pumasportstyle",
            "puma.usa","puma.uk","puma.de","pumafrance","pumaau","pumanordic",
            // Hyrox (fitness event brand)
            "hyroxworld","hyroxamerica","hyroxnordic","hyroxpoland","hyrox.france","hyroxanz",
            // SA retail brands
            "woolworths_sa","wooliesbeauty","checkers_sa","checkers_sixty60",
            "clicks_sa","takealotcom","beautybytakealot","superbalistsa","mrpricesa",
            "cottonon_za","luvmehair_southafrica","maynardssa","krispykreme_za",
            // SA banks/finance
            "capitecbank","nedbank","standardbankza","fnbsouthafrica","absasouthafrica",
            "nedbankprivatewealth",
            // SA telcos/tech
            "mtnza","vodacomsa","telkomsa","vodacomlesotho","samsungmobilesa",
            "sonyalphasa","msigaming_za","cameraland_sandton",
            // SA media/entertainment brands
            "netflixsa","etvonline","multichoiceza","showmax","dstv",
            // SA beauty/cosmetics brands
            "garnier_sa","niveasouthafrica","darkandlovelyafrica","essence_cosmetics",
            "essence.cosmetics.africa","pastry_skincare","micas.official","micascurve",
            // SA sports clubs/orgs
            "orlandopirates","tsgalaxyfc","dhlstormers","bafanabafanaofficial",
            "durbancityfc","safa_dot_net","officialpsl_za","absawildeklawer.sport",
            // SA events/other brands
            "capetownmarathon","imprint_za","humanzsouthafrica","volvocarsa",
            "wwtaste","theyare.girlshq","thebestchefawards","comicconcapetown",
            "realkotafestival","comicschoiceawards","discoverysport","discoverysa",
            // Restaurants/venues
            "restaurantalchemist","thepotluckclubct","fynrestaurantcpt",
            "thelivingroomatsummerhill","rosewoodbangkok","dewakanmy","diverxo",
            // Global celebrities (not SA influencers)
            "leomessi","lilbieber","davidbeckham","eminem","zidane","lamineyamal",
            "judebellingham","hm","zara","pedri","tchalamet","o.dembele7","raphinha",
            "jayshetty","usher","alessandrodelpiero","rayan_cherki","sant.gimenez",
            "kanginleeoficial","massimobottura","dabizdiverxo","bradley_dls",
            "icewear_vezzo","cadecunn1ngham","bigsean","lewishowes","mdmotivator",
            "soccerbible","jeffhamilton","visit.dubai","dubai","detroitpistons",
            "deliciouslyella","speedymorman","trinity_rodman","jalenvseverybody",
            "joannawietrzyk","khrisriddicktynes","ahluwalia","priya.ahluwalia1",
            "donlifecircle","dycofficial","tomgores","stevesteinfeld","hidde.w",
            "zenojones","jessrosval","donnellyabi","mjac0by","alancao_",
            "robert_marawa","madlion_bdp","americanjewelry","sishiiofficial",
        };

        // Instagram category_name → NicheId mapping
        private static readonly Dictionary<string, int> CategoryToNiche = new(StringComparer.OrdinalIgnoreCase)
        {
            { "fitness", 1 }, { "athlete", 1 }, { "sports", 1 }, { "personal trainer", 1 },
            { "health", 1 }, { "gym", 1 }, { "runner", 1 }, { "yoga", 1 },
            { "fashion", 2 }, { "clothing", 2 }, { "model", 2 }, { "stylist", 2 },
            { "designer", 2 }, { "fashion designer", 2 },
            { "food", 3 }, { "chef", 3 }, { "restaurant", 3 }, { "baker", 3 },
            { "cooking", 3 }, { "recipe", 3 }, { "foodie", 3 },
            { "beauty", 4 }, { "makeup", 4 }, { "skincare", 4 }, { "cosmetics", 4 },
            { "hair", 4 }, { "nail", 4 },
            { "tech", 5 }, { "technology", 5 }, { "software", 5 }, { "gaming", 8 },
            { "gamer", 8 }, { "esports", 8 },
            { "travel", 6 }, { "adventure", 6 }, { "explorer", 6 },
            { "comedian", 11 }, { "comedy", 11 }, { "skit", 11 }, { "humour", 11 },
            { "humor", 11 },
            { "musician", 13 }, { "artist", 13 }, { "singer", 13 }, { "rapper", 13 },
            { "dj", 13 }, { "entertainer", 13 }, { "actor", 13 }, { "actress", 13 },
            { "producer", 13 }, { "media", 13 },
            { "finance", 9 }, { "investor", 9 }, { "entrepreneur", 9 },
            { "parent", 10 }, { "mom", 10 }, { "dad", 10 }, { "family", 10 },
            { "public figure", 7 }, { "lifestyle", 7 }, { "blogger", 7 },
            { "influencer", 7 }, { "content creator", 7 },
        };

        // Brand category keywords — accounts with these ARE brands not influencers
        private static readonly HashSet<string> BrandCategoryKeywords = new(StringComparer.OrdinalIgnoreCase)
        {
            "retail", "shopping", "grocery", "supermarket", "store", "shop",
            "bank", "banking", "insurance", "financial service",
            "telecom", "telecommunications", "internet provider",
            "automotive", "car dealership", "airline", "hotel", "travel agency",
            "software company", "app", "news", "media company", "publisher",
            "sports team", "football club", "rugby club", "cricket club",
            "government", "non-profit", "charity", "hospital", "clinic",
            "gym", "fitness studio", "spa", "salon",
            "event", "festival", "conference", "award",
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

        // ── Niche detection from category_name ───────────────────────────
        private int DetectNiche(string? categoryName, int fallbackNicheId)
        {
            if (string.IsNullOrEmpty(categoryName)) return fallbackNicheId;
            foreach (var kvp in CategoryToNiche)
                if (categoryName.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                    return kvp.Value;
            return fallbackNicheId;
        }

        // ── Brand detection ───────────────────────────────────────────────
        private bool IsBrandAccount(InstagramProfile profile)
        {
            // Check permanent blocklist first
            if (PermanentBlocklist.Contains(profile.Username)) return true;

            // Check Instagram category
            if (!string.IsNullOrEmpty(profile.CategoryName))
                foreach (var keyword in BrandCategoryKeywords)
                    if (profile.CategoryName.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                        return true;

            // Business account with very low following = brand pattern
            if (profile.IsBusinessAccount && profile.FollowersCount > 10000
                && profile.FollowsCount < 150)
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
            return tagged.Select(u => new DiscoveredAccount
            {
                Handle = u, Name = u,
                DiscoverySource = "TaggedInPost",
                DiscoveredFromInfluencerId = influencerId
            }).ToList();
        }

        public async Task<DiscoveredAccount?> QualifyAccountAsync(
            string handle, CancellationToken ct)
        {
            try
            {
                var clean = handle.TrimStart('@').ToLower();

                // Check permanent blocklist first — no API call needed
                if (PermanentBlocklist.Contains(clean))
                {
                    _logger.LogDebug("Blocked @{Handle}", clean);
                    return null;
                }

                var profile = await _instagramService.GetPublicProfileAsync(clean);
                if (profile == null) return null;

                // Reject brands
                if (IsBrandAccount(profile))
                {
                    _logger.LogInformation("Skipping brand @{Handle} (category: {Category})",
                        clean, profile.CategoryName);
                    return null;
                }

                if (profile.FollowersCount < InfluencerThresholds.MinFollowers)
                    return null;

                var media = await _instagramService.GetMediaAsync(clean);
                await Task.Delay(500, CancellationToken.None);

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
                    DiscoverySource = "GraphExpansion",
                    // Store category for niche detection
                    DiscoveryContext = profile.CategoryName
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

                // Final blocklist check before DB write
                if (PermanentBlocklist.Contains(clean)) return null;

                var exists = await ctx.Influencers
                    .AnyAsync(i => i.InstagramHandle == "@" + clean ||
                                   i.DisplayName == clean, ct);
                if (exists) return null;

                // Detect niche from category_name, fall back to brand niche
                var detectedNiche = DetectNiche(account.DiscoveryContext, nicheId);

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
                    NicheId = detectedNiche,
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

                _logger.LogInformation("✓ @{Handle} | {Followers} followers | Niche: {Niche} | Category: {Category}",
                    clean, account.FollowerCount, detectedNiche, account.DiscoveryContext);

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
                    _logger.LogInformation("Mining @{Brand}", brandHandle);
                    var tagged = await _instagramService.GetTaggedUsersAsync(brandHandle);
                    _logger.LogInformation("@{Brand}: {Count} tagged", brandHandle, tagged.Count);

                    foreach (var candidate in tagged)
                    {
                        if (ct.IsCancellationRequested) break;
                        if (PermanentBlocklist.Contains(candidate.ToLower())) continue;
                        var qualified = await QualifyAccountAsync(candidate, ct);
                        if (qualified == null) continue;
                        var id = await IngestAccountAsync(qualified, nicheId, 1, ct);
                        if (id.HasValue) discovered++;
                        await Task.Delay(ThrottleDelay, CancellationToken.None);
                    }
                }
                catch (Exception ex) { _logger.LogError(ex, "Error mining @{Brand}", brandHandle); }
                await Task.Delay(ThrottleDelay, CancellationToken.None);
            }

            // ── Step 2: Expand from ALL existing influencers ──────────────
            List<Influencer> allInfluencers;
            using (var scope = _scopeFactory.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                allInfluencers = await ctx.Influencers
                    .Where(i => !string.IsNullOrEmpty(i.InstagramHandle))
                    .ToListAsync(ct);
            }

            _logger.LogInformation("Expanding from {Count} influencers", allInfluencers.Count);

            foreach (var influencer in allInfluencers)
            {
                if (ct.IsCancellationRequested) break;
                var handle = influencer.InstagramHandle!.TrimStart('@');

                try
                {
                    var tagged = await _instagramService.GetTaggedUsersAsync(handle);
                    foreach (var taggedHandle in tagged)
                    {
                        if (ct.IsCancellationRequested) break;
                        if (PermanentBlocklist.Contains(taggedHandle.ToLower())) continue;

                        var profile = await _instagramService.GetPublicProfileAsync(taggedHandle);
                        if (profile == null) { await Task.Delay(500, CancellationToken.None); continue; }

                        if (profile.IsBusinessAccount && profile.FollowersCount > 10000)
                        {
                            // It's a brand — mine its tagged users too
                            _logger.LogInformation("Found brand @{Brand} from @{Influencer} — mining",
                                taggedHandle, handle);
                            var brandTagged = await _instagramService.GetTaggedUsersAsync(taggedHandle);
                            foreach (var candidate in brandTagged)
                            {
                                if (ct.IsCancellationRequested) break;
                                if (PermanentBlocklist.Contains(candidate.ToLower())) continue;
                                var qualified = await QualifyAccountAsync(candidate, ct);
                                if (qualified == null) continue;
                                var id = await IngestAccountAsync(qualified, influencer.NicheId, influencer.MarketId, ct);
                                if (id.HasValue) discovered++;
                                await Task.Delay(ThrottleDelay, CancellationToken.None);
                            }
                        }
                        else
                        {
                            // It's a person — qualify and ingest directly
                            var qualified = await QualifyAccountAsync(taggedHandle, ct);
                            if (qualified != null)
                            {
                                qualified.DiscoveredFromInfluencerId = influencer.Id;
                                var id = await IngestAccountAsync(qualified, influencer.NicheId, influencer.MarketId, ct);
                                if (id.HasValue) discovered++;
                            }
                        }
                        await Task.Delay(ThrottleDelay, CancellationToken.None);
                    }
                }
                catch (Exception ex) { _logger.LogError(ex, "Expansion error for @{Handle}", handle); }
                await Task.Delay(ThrottleDelay, CancellationToken.None);
            }

            _logger.LogInformation("Discovery complete. {Count} new influencers added", discovered);
        }
    }
}
