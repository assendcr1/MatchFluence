using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace BackendAPI.Services.Discovery
{
    public class InfluencerDiscoveryService : IInfluencerDiscoveryService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IInstagramService _instagramService;
        private readonly BotScoreCalculator _botScoreCalculator;
        private readonly ILogger<InfluencerDiscoveryService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _accessToken;
        private readonly string _instagramUserId;

        private static readonly TimeSpan ApiDelay = TimeSpan.FromMilliseconds(600);

        public InfluencerDiscoveryService(
            IServiceScopeFactory scopeFactory,
            IInstagramService instagramService,
            BotScoreCalculator botScoreCalculator,
            ILogger<InfluencerDiscoveryService> logger,
            HttpClient httpClient,
            IConfiguration config)
        {
            _scopeFactory = scopeFactory;
            _instagramService = instagramService;
            _botScoreCalculator = botScoreCalculator;
            _logger = logger;
            _httpClient = httpClient;
            _accessToken = config["InstagramSettings:AccessToken"] ?? "";

            // Fixed — ig_hashtag_search requires the real Instagram Business Account ID
            // not the string "me". Read from config so it's easy to change.
            _instagramUserId = config["InstagramSettings:UserId"] ?? "";
        }

        public async Task<List<DiscoveredAccount>> MineHashtagsAsync(
            string niche,
            List<string> hashtags,
            CancellationToken cancellationToken)
        {
            var discovered = new List<DiscoveredAccount>();

            if (string.IsNullOrEmpty(_instagramUserId))
            {
                _logger.LogWarning("InstagramSettings:UserId not configured — hashtag mining skipped");
                return discovered;
            }

            foreach (var hashtag in hashtags)
            {
                if (cancellationToken.IsCancellationRequested) break;

                try
                {
                    _logger.LogInformation("Mining hashtag #{Hashtag} for niche {Niche}", hashtag, niche);

                    var hashtagId = await GetHashtagIdAsync(hashtag, cancellationToken);
                    if (string.IsNullOrEmpty(hashtagId))
                    {
                        _logger.LogWarning("Could not resolve hashtag ID for #{Hashtag}", hashtag);
                        continue;
                    }

                    var mediaList = await GetHashtagMediaAsync(hashtagId, cancellationToken);

                    foreach (var media in mediaList)
                    {
                        if (string.IsNullOrEmpty(media.AuthorHandle)) continue;

                        var mentions = ExtractMentions(media.Caption);

                        discovered.Add(new DiscoveredAccount
                        {
                            Handle = media.AuthorHandle,
                            Name = media.AuthorHandle,
                            Platform = "Instagram",
                            DiscoverySource = "HashtagMining",
                            DiscoveryContext = hashtag,
                            ExtractedHashtags = ExtractHashtags(media.Caption),
                            MentionedAccounts = mentions
                        });

                        foreach (var mention in mentions)
                        {
                            discovered.Add(new DiscoveredAccount
                            {
                                Handle = mention,
                                Name = mention,
                                Platform = "Instagram",
                                DiscoverySource = "CaptionMining",
                                DiscoveryContext = $"Mentioned in #{hashtag} post"
                            });
                        }
                    }

                    await Task.Delay(ApiDelay, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to mine hashtag #{Hashtag}", hashtag);
                }
            }

            return discovered
                .GroupBy(d => d.Handle.ToLower())
                .Select(g => g.First())
                .ToList();
        }

        public async Task<List<DiscoveredAccount>> ExpandFromInfluencerAsync(
            Guid influencerId,
            CancellationToken cancellationToken)
        {
            var discovered = new List<DiscoveredAccount>();

            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var influencer = await context.Influencers.FindAsync(
                new object[] { influencerId }, cancellationToken);

            if (influencer == null || string.IsNullOrEmpty(influencer.InstagramHandle))
                return discovered;

            var handle = influencer.InstagramHandle.TrimStart('@');

            try
            {
                var media = await _instagramService.GetMediaAsync(handle);
                if (media == null || !media.Any())
                    return discovered;

                foreach (var post in media.Take(20))
                {
                    if (string.IsNullOrEmpty(post.Caption)) continue;

                    var mentions = ExtractMentions(post.Caption);
                    var hashtags = ExtractHashtags(post.Caption);

                    foreach (var mention in mentions)
                    {
                        discovered.Add(new DiscoveredAccount
                        {
                            Handle = mention,
                            Name = mention,
                            Platform = "Instagram",
                            DiscoverySource = "GraphExpansion",
                            DiscoveredFromInfluencerId = influencerId,
                            DiscoveryContext = $"Mentioned by @{handle}",
                            ExtractedHashtags = hashtags
                        });
                    }
                }

                _logger.LogInformation("Graph expansion from @{Handle} found {Count} candidates",
                    handle, discovered.Count);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Graph expansion failed for influencer {Id}", influencerId);
            }

            return discovered
                .GroupBy(d => d.Handle.ToLower())
                .Select(g => g.First())
                .ToList();
        }

        public async Task<DiscoveredAccount?> QualifyAccountAsync(
            string handle,
            CancellationToken cancellationToken)
        {
            try
            {
                var cleanHandle = handle.TrimStart('@');
                var profile = await _instagramService.GetProfileAsync(cleanHandle);

                if (profile == null) return null;

                if (profile.FollowersCount < InfluencerThresholds.MinFollowers)
                {
                    _logger.LogDebug("@{Handle} disqualified — {Followers} followers below threshold",
                        handle, profile.FollowersCount);
                    return null;
                }

                if (profile.MediaCount < InfluencerThresholds.MinPostCount)
                {
                    _logger.LogDebug("@{Handle} disqualified — only {Posts} posts",
                        handle, profile.MediaCount);
                    return null;
                }

                var media = await _instagramService.GetMediaAsync(cleanHandle);
                decimal engagementRate = 0;

                if (media != null && media.Any() && profile.FollowersCount > 0)
                {
                    var recent = media.Take(10).ToList();
                    var totalEngagement = recent.Sum(m => m.LikeCount + m.CommentsCount);
                    engagementRate = Math.Round(
                        (decimal)totalEngagement / recent.Count / profile.FollowersCount * 100, 2);
                }

                if (engagementRate < InfluencerThresholds.MinEngagementRate)
                {
                    _logger.LogDebug("@{Handle} disqualified — {Rate}% engagement below threshold",
                        handle, engagementRate);
                    return null;
                }

                var botScore = _botScoreCalculator.Calculate(
                    followerCount: profile.FollowersCount,
                    followingCount: profile.FollowsCount,
                    engagementRate: engagementRate,
                    postCount: profile.MediaCount,
                    accountAgeDays: 365);

                if (botScore > InfluencerThresholds.MaxBotScore)
                {
                    _logger.LogDebug("@{Handle} disqualified — bot score {Score} too high",
                        handle, botScore);
                    return null;
                }

                _logger.LogInformation(
                    "@{Handle} qualified — {Followers} followers, {Rate}% engagement, bot score {Bot}",
                    handle, profile.FollowersCount, engagementRate, botScore);

                return new DiscoveredAccount
                {
                    Handle = cleanHandle,
                    Name = profile.Name ?? cleanHandle,
                    FollowerCount = profile.FollowersCount,
                    FollowingCount = profile.FollowsCount,
                    PostCount = profile.MediaCount,
                    EngagementRate = engagementRate,
                    Platform = "Instagram",
                    ExtractedHashtags = media?
                        .Take(5)
                        .SelectMany(m => ExtractHashtags(m.Caption ?? ""))
                        .Distinct()
                        .ToList() ?? new()
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Qualification failed for @{Handle}", handle);
                return null;
            }
        }

        public async Task<Guid?> IngestAccountAsync(
            DiscoveredAccount account,
            int nicheId,
            int marketId,
            CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var exists = await context.Influencers
                .AnyAsync(i => i.InstagramHandle == "@" + account.Handle ||
                               i.DisplayName == account.Handle,
                    cancellationToken);

            if (exists)
            {
                _logger.LogDebug("@{Handle} already in database — skipping", account.Handle);
                return null;
            }

            var botScore = _botScoreCalculator.Calculate(
                followerCount: account.FollowerCount,
                followingCount: account.FollowingCount,
                engagementRate: account.EngagementRate,
                postCount: account.PostCount,
                accountAgeDays: 365);

            var influencer = new Influencer
            {
                Id = Guid.NewGuid(),
                Name = account.Name,
                DisplayName = account.Handle,
                Platform = account.Platform,
                NicheId = nicheId,
                MarketId = marketId,
                FollowerCount = account.FollowerCount,
                EngagementRate = account.EngagementRate,
                BotScore = botScore,
                InstagramHandle = "@" + account.Handle,
                Email = $"{account.Handle}@placeholder.com",
                RefreshPriority = InfluencerThresholds.PriorityLow,
                DiscoverySource = account.DiscoverySource,
                DiscoveredFromInfluencerId = account.DiscoveredFromInfluencerId,
                IsVerified = false,
                LastDataRefresh = DateTime.UtcNow,
                NextRefreshDue = DateTime.UtcNow.AddHours(InfluencerThresholds.LowPriorityRefreshHours)
            };

            context.Influencers.Add(influencer);
            await context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Ingested @{Handle} — {Followers} followers, niche {NicheId}, source: {Source}",
                account.Handle, account.FollowerCount, nicheId, account.DiscoverySource);

            return influencer.Id;
        }

        public async Task RunDiscoveryCycleAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting influencer discovery cycle");

            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var niches = await context.Niches.ToListAsync(cancellationToken);
            var markets = await context.Markets.ToListAsync(cancellationToken);
            var defaultMarketId = markets.FirstOrDefault()?.Id ?? 1;

            int totalDiscovered = 0;
            int totalIngested = 0;

            foreach (var niche in niches)
            {
                if (cancellationToken.IsCancellationRequested) break;

                _logger.LogInformation("Running discovery for niche: {Niche}", niche.NicheName);

                var hashtags = GetHashtagsForNiche(niche.NicheName);
                var hashtagCandidates = await MineHashtagsAsync(niche.NicheName, hashtags, cancellationToken);
                totalDiscovered += hashtagCandidates.Count;

                // Fixed — added OrderBy to suppress EF warning
                var seeds = await context.Influencers
                    .Where(i => i.NicheId == niche.Id &&
                                i.RefreshPriority == InfluencerThresholds.PriorityHigh)
                    .OrderBy(i => i.Id)
                    .Select(i => i.Id)
                    .Take(10)
                    .ToListAsync(cancellationToken);

                var graphCandidates = new List<DiscoveredAccount>();
                foreach (var seedId in seeds)
                {
                    if (cancellationToken.IsCancellationRequested) break;
                    var expanded = await ExpandFromInfluencerAsync(seedId, cancellationToken);
                    graphCandidates.AddRange(expanded);
                    await Task.Delay(ApiDelay, cancellationToken);
                }

                totalDiscovered += graphCandidates.Count;

                var allCandidates = hashtagCandidates
                    .Concat(graphCandidates)
                    .GroupBy(d => d.Handle.ToLower())
                    .Select(g => g.First())
                    .ToList();

                foreach (var candidate in allCandidates)
                {
                    if (cancellationToken.IsCancellationRequested) break;

                    var qualified = await QualifyAccountAsync(candidate.Handle, cancellationToken);
                    if (qualified == null) continue;

                    qualified.DiscoverySource = candidate.DiscoverySource;
                    qualified.DiscoveredFromInfluencerId = candidate.DiscoveredFromInfluencerId;

                    var newId = await IngestAccountAsync(qualified, niche.Id, defaultMarketId, cancellationToken);
                    if (newId.HasValue) totalIngested++;

                    await Task.Delay(ApiDelay, cancellationToken);
                }
            }

            _logger.LogInformation(
                "Discovery cycle complete. Candidates found: {Discovered}, New influencers ingested: {Ingested}",
                totalDiscovered, totalIngested);
        }

        private List<string> GetHashtagsForNiche(string nicheName)
        {
            return nicheName.ToLower() switch
            {
                "fitness" => new() { "fitness", "workout", "gym", "fitnessmotivation",
                                     "healthylifestyle", "personaltrainer", "gains" },
                "food" => new() { "foodie", "instafood", "foodphotography",
                                   "cooking", "chef", "recipe", "homecooking" },
                "fashion" => new() { "fashion", "style", "ootd", "streetstyle",
                                      "fashionblogger", "outfitoftheday" },
                "beauty" => new() { "beauty", "makeup", "skincare", "beautyblogger",
                                     "makeuptutorial", "glam" },
                "tech" => new() { "tech", "technology", "gadgets", "techreview",
                                   "innovation", "coding", "developer" },
                "travel" => new() { "travel", "wanderlust", "travelgram",
                                     "travelblogger", "adventure", "explore" },
                "lifestyle" => new() { "lifestyle", "dailylife", "inspiration",
                                        "motivation", "selfcare", "wellness" },
                _ => new() { nicheName.ToLower().Replace(" ", ""),
                             nicheName.ToLower().Replace(" ", "") + "lifestyle" }
            };
        }

        private async Task<string?> GetHashtagIdAsync(string hashtag, CancellationToken cancellationToken)
        {
            try
            {
                // Fixed — uses real Instagram Business Account ID from config
                // instead of the string "me" which the API rejects
                var url = $"https://graph.facebook.com/v19.0/ig_hashtag_search" +
                          $"?user_id={_instagramUserId}&q={Uri.EscapeDataString(hashtag)}" +
                          $"&access_token={_accessToken}";

                var response = await _httpClient.GetAsync(url, cancellationToken);
                if (!response.IsSuccessStatusCode) return null;

                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                using var doc = JsonDocument.Parse(content);

                if (doc.RootElement.TryGetProperty("data", out var data) &&
                    data.GetArrayLength() > 0)
                    return data[0].GetProperty("id").GetString();

                return null;
            }
            catch
            {
                return null;
            }
        }

        private async Task<List<HashtagMediaItem>> GetHashtagMediaAsync(
            string hashtagId,
            CancellationToken cancellationToken)
        {
            try
            {
                var url = $"https://graph.facebook.com/v19.0/{hashtagId}/recent_media" +
                          $"?fields=id,caption,media_type,username" +
                          $"&access_token={_accessToken}";

                var response = await _httpClient.GetAsync(url, cancellationToken);
                if (!response.IsSuccessStatusCode) return new();

                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                using var doc = JsonDocument.Parse(content);

                var items = new List<HashtagMediaItem>();

                if (doc.RootElement.TryGetProperty("data", out var data))
                {
                    foreach (var item in data.EnumerateArray())
                    {
                        items.Add(new HashtagMediaItem
                        {
                            AuthorHandle = item.TryGetProperty("username", out var u)
                                ? u.GetString() ?? "" : "",
                            Caption = item.TryGetProperty("caption", out var c)
                                ? c.GetString() ?? "" : ""
                        });
                    }
                }

                return items;
            }
            catch
            {
                return new();
            }
        }

        private List<string> ExtractMentions(string? text)
        {
            if (string.IsNullOrEmpty(text)) return new();
            return Regex.Matches(text, @"@([A-Za-z0-9._]+)")
                .Select(m => m.Groups[1].Value)
                .Where(h => h.Length >= 3 && h.Length <= 30)
                .Distinct()
                .ToList();
        }

        private List<string> ExtractHashtags(string? text)
        {
            if (string.IsNullOrEmpty(text)) return new();
            return Regex.Matches(text, @"#([A-Za-z0-9_]+)")
                .Select(m => m.Groups[1].Value.ToLower())
                .Where(h => h.Length >= 2 && h.Length <= 30)
                .Distinct()
                .ToList();
        }

        private class HashtagMediaItem
        {
            public string AuthorHandle { get; set; } = "";
            public string Caption { get; set; } = "";
        }
    }
}