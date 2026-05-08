using BackendAPI.Models;
using System.Text.Json;

namespace BackendAPI.Services
{
    public class InstagramService : IInstagramService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _rapidApiKey;
        private readonly string _rapidApiHost;
        private readonly ILogger<InstagramService> _logger;

        private const string BaseUrl = "https://instagram-public-bulk-scraper.p.rapidapi.com";

        public InstagramService(
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<InstagramService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _rapidApiKey = config["RapidApiSettings:Key"] ?? "";
            _rapidApiHost = config["RapidApiSettings:Host"] ?? "instagram-public-bulk-scraper.p.rapidapi.com";
            _logger = logger;
        }

        private HttpClient CreateClient()
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Add("X-RapidAPI-Key", _rapidApiKey);
            client.DefaultRequestHeaders.Add("X-RapidAPI-Host", _rapidApiHost);
            return client;
        }

        public async Task<InstagramProfile?> GetProfileAsync(string userId)
            => await GetPublicProfileAsync(userId);

        public async Task<InstagramProfile?> GetPublicProfileAsync(string username)
        {
            try
            {
                var clean = username.TrimStart('@').ToLower();
                var client = CreateClient();
                var response = await client.GetAsync($"{BaseUrl}/v1/user_info_web?username={clean}");

                if (!response.IsSuccessStatusCode)
                {
                    var err = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("RapidAPI profile error for @{Username}: {Error}", clean, err);
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("data", out var data))
                    return null;

                var followers = data.TryGetProperty("edge_followed_by", out var efb)
                    && efb.TryGetProperty("count", out var fc) ? fc.GetInt32() : 0;
                var following = data.TryGetProperty("edge_follow", out var ef)
                    && ef.TryGetProperty("count", out var fwc) ? fwc.GetInt32() : 0;
                var posts = data.TryGetProperty("edge_owner_to_timeline_media", out var eotm)
                    && eotm.TryGetProperty("count", out var pc) ? pc.GetInt32() : 0;
                var uname = data.TryGetProperty("username", out var u) ? u.GetString() ?? clean : clean;
                var fullName = data.TryGetProperty("full_name", out var fn) ? fn.GetString() ?? "" : "";
                var isVerified = data.TryGetProperty("is_verified", out var iv) && iv.GetBoolean();
                var isBusinessAccount = data.TryGetProperty("is_business_account", out var iba) && iba.GetBoolean();
                var categoryName = data.TryGetProperty("category_name", out var cn) ? cn.GetString() : null;
                var biography = data.TryGetProperty("biography", out var bio) ? bio.GetString() : null;

                _logger.LogInformation("✓ @{Username} — {Followers} followers", clean, followers);

                return new InstagramProfile
                {
                    Id = data.TryGetProperty("id", out var id) ? id.GetString() ?? "" : "",
                    Username = uname,
                    Name = fullName,
                    FollowersCount = followers,
                    FollowsCount = following,
                    MediaCount = posts,
                    IsVerified = isVerified,
                    IsBusinessAccount = isBusinessAccount,
                    CategoryName = categoryName,
                    Biography = biography
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RapidAPI profile error for @{Username}", username);
                return null;
            }
        }

        public async Task<List<InstagramMedia>> GetMediaAsync(string username)
        {
            try
            {
                var clean = username.TrimStart('@').ToLower();
                var client = CreateClient();
                var response = await client.GetAsync($"{BaseUrl}/v2/user_posts?username_or_id={clean}");

                if (!response.IsSuccessStatusCode) return new();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var media = new List<InstagramMedia>();

                // Structure: { data: { items: [ { like_count, comment_count, id, media_type } ] } }
                if (!doc.RootElement.TryGetProperty("data", out var data)) return media;
                if (!data.TryGetProperty("items", out var items)) return media;
                if (items.ValueKind != JsonValueKind.Array) return media;

                foreach (var item in items.EnumerateArray().Take(10))
                {
                    var likes = item.TryGetProperty("like_count", out var lc) ? lc.GetInt32() : 0;
                    var comments = item.TryGetProperty("comment_count", out var cc) ? cc.GetInt32() : 0;
                    var mediaType = item.TryGetProperty("media_type", out var mt) ? mt.GetInt32().ToString() : "";
                    var id = item.TryGetProperty("id", out var mid) ? mid.GetString() ?? "" : "";

                    media.Add(new InstagramMedia
                    {
                        Id = id,
                        LikeCount = likes,
                        CommentsCount = comments,
                        MediaType = mediaType
                    });
                }

                _logger.LogInformation("Media for @{Username}: {Count} posts parsed", clean, media.Count);
                return media;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RapidAPI media error for @{Username}", username);
                return new();
            }
        }

        public async Task<List<string>> GetSimilarUsersAsync(string username)
        {
            try
            {
                var clean = username.TrimStart('@').ToLower();
                var client = CreateClient();
                var response = await client.GetAsync($"{BaseUrl}/v1/similar_users?username={clean}");

                if (!response.IsSuccessStatusCode) return new();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var usernames = new List<string>();

                // Structure: { data: { edges: [ { node: { username, id, ... } } ] } }
                if (doc.RootElement.TryGetProperty("data", out var data)
                    && data.TryGetProperty("edges", out var edges)
                    && edges.ValueKind == JsonValueKind.Array)
                {
                    foreach (var edge in edges.EnumerateArray().Take(20))
                    {
                        var node = edge.TryGetProperty("node", out var n) ? n : edge;
                        if (node.TryGetProperty("username", out var u)
                            && u.GetString() is string uname
                            && !string.IsNullOrEmpty(uname))
                            usernames.Add(uname);
                    }
                }

                _logger.LogInformation("Similar users for @{Username}: {Count} found", clean, usernames.Count);
                return usernames;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Similar users error for @{Username}", username);
                return new();
            }
        }

        public async Task<List<string>> GetTaggedUsersAsync(string username)
        {
            try
            {
                var clean = username.TrimStart('@').ToLower();
                var client = CreateClient();
                var response = await client.GetAsync($"{BaseUrl}/v2/user_posts?username_or_id={clean}");

                if (!response.IsSuccessStatusCode) return new();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                var tagged = new HashSet<string>();

                // Structure: { data: { items: [ { usertags: { in: [ { user: { username } } ] } } ] } }
                if (!doc.RootElement.TryGetProperty("data", out var data)) return new();
                if (!data.TryGetProperty("items", out var items)) return new();
                if (items.ValueKind != JsonValueKind.Array) return new();

                foreach (var item in items.EnumerateArray().Take(12))
                {
                    // usertags.in[] contains tagged users
                    if (item.TryGetProperty("usertags", out var usertags)
                        && usertags.TryGetProperty("in", out var taggedIn)
                        && taggedIn.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var tag in taggedIn.EnumerateArray())
                        {
                            if (tag.TryGetProperty("user", out var user)
                                && user.TryGetProperty("username", out var u)
                                && u.GetString() is string uname
                                && !string.IsNullOrEmpty(uname))
                                tagged.Add(uname);
                        }
                    }

                    // Also check caption mentions via coauthor_producers
                    if (item.TryGetProperty("coauthor_producers", out var coauthors)
                        && coauthors.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var coauthor in coauthors.EnumerateArray())
                        {
                            if (coauthor.TryGetProperty("username", out var u)
                                && u.GetString() is string uname
                                && !string.IsNullOrEmpty(uname))
                                tagged.Add(uname);
                        }
                    }
                }

                _logger.LogInformation("Tagged users for @{Username}: {Count} found", clean, tagged.Count);
                return tagged.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tagged users error for @{Username}", username);
                return new();
            }
        }

        public Task<MediaInsights?> GetMediaInsightsAsync(string mediaId) => Task.FromResult<MediaInsights?>(null);
        public Task<AccountInsights?> GetAccountInsightsAsync(string userId) => Task.FromResult<AccountInsights?>(null);
    }
}
