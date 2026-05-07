using BackendAPI.Models;
using System.Text.Json;

namespace BackendAPI.Services
{
    public class InstagramService : IInstagramService
    {
        private readonly HttpClient _httpClient;
        private readonly string _rapidApiKey;
        private readonly string _rapidApiHost;
        private readonly ILogger<InstagramService> _logger;

        private const string BaseUrl = "https://instagram-public-bulk-scraper.p.rapidapi.com";

        public InstagramService(
            HttpClient httpClient,
            IConfiguration config,
            ILogger<InstagramService> logger)
        {
            _httpClient = httpClient;
            _rapidApiKey = config["RapidApiSettings:Key"] ?? "";
            _rapidApiHost = config["RapidApiSettings:Host"] ?? "instagram-public-bulk-scraper.p.rapidapi.com";
            _logger = logger;

            if (!_httpClient.DefaultRequestHeaders.Contains("X-RapidAPI-Key"))
            {
                _httpClient.DefaultRequestHeaders.Add("X-RapidAPI-Key", _rapidApiKey);
                _httpClient.DefaultRequestHeaders.Add("X-RapidAPI-Host", _rapidApiHost);
            }
        }

        public async Task<InstagramProfile?> GetProfileAsync(string userId)
        {
            return await GetPublicProfileAsync(userId);
        }

        public async Task<InstagramProfile?> GetPublicProfileAsync(string username)
        {
            try
            {
                var clean = username.TrimStart('@').ToLower();
                // Correct endpoint: /v1/user_info_web?username=handle
                var url = $"{BaseUrl}/v1/user_info_web?username={clean}";

                var response = await _httpClient.GetAsync(url);
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
                var igId = data.TryGetProperty("id", out var id) ? id.GetString() ?? "" : "";

                return new InstagramProfile
                {
                    Id = igId,
                    Username = uname,
                    Name = fullName,
                    FollowersCount = followers,
                    FollowsCount = following,
                    MediaCount = posts,
                    IsVerified = isVerified
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
                // Correct endpoint: /v2/user_posts?username_or_id=handle
                var url = $"{BaseUrl}/v2/user_posts?username_or_id={clean}";

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return new();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("data", out var data))
                    return new();

                if (!data.TryGetProperty("edges", out var edges))
                    return new();

                var media = new List<InstagramMedia>();

                foreach (var edge in edges.EnumerateArray().Take(10))
                {
                    if (!edge.TryGetProperty("node", out var node)) continue;

                    var likes = node.TryGetProperty("edge_liked_by", out var elb)
                        && elb.TryGetProperty("count", out var lc) ? lc.GetInt32() : 0;

                    var comments = node.TryGetProperty("edge_media_to_comment", out var emc)
                        && emc.TryGetProperty("count", out var cc) ? cc.GetInt32() : 0;

                    var mediaType = node.TryGetProperty("__typename", out var mt)
                        ? mt.GetString() ?? "" : "";

                    media.Add(new InstagramMedia
                    {
                        Id = node.TryGetProperty("id", out var id) ? id.GetString() ?? "" : "",
                        LikeCount = likes,
                        CommentsCount = comments,
                        MediaType = mediaType
                    });
                }

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
                // Correct endpoint: /v1/similar_users?username=handle
                var url = $"{BaseUrl}/v1/similar_users?username={clean}";

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return new();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                var usernames = new List<string>();

                // Try data array directly
                if (doc.RootElement.TryGetProperty("data", out var data))
                {
                    if (data.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in data.EnumerateArray().Take(20))
                        {
                            if (item.TryGetProperty("username", out var u))
                            {
                                var uname = u.GetString();
                                if (!string.IsNullOrEmpty(uname))
                                    usernames.Add(uname);
                            }
                        }
                    }
                }

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
                var url = $"{BaseUrl}/v2/user_posts?username_or_id={clean}";

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return new();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("data", out var data))
                    return new();

                if (!data.TryGetProperty("edges", out var edges))
                    return new();

                var tagged = new HashSet<string>();

                foreach (var edge in edges.EnumerateArray().Take(10))
                {
                    if (!edge.TryGetProperty("node", out var node)) continue;
                    if (!node.TryGetProperty("edge_media_to_tagged_user", out var taggedUsers)) continue;
                    if (!taggedUsers.TryGetProperty("edges", out var tagEdges)) continue;

                    foreach (var tagEdge in tagEdges.EnumerateArray())
                    {
                        if (!tagEdge.TryGetProperty("node", out var tagNode)) continue;
                        if (!tagNode.TryGetProperty("user", out var user)) continue;
                        if (!user.TryGetProperty("username", out var uname)) continue;

                        var u = uname.GetString();
                        if (!string.IsNullOrEmpty(u))
                            tagged.Add(u);
                    }
                }

                return tagged.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tagged users error for @{Username}", username);
                return new();
            }
        }

        public async Task<MediaInsights?> GetMediaInsightsAsync(string mediaId)
        {
            return null;
        }

        public async Task<AccountInsights?> GetAccountInsightsAsync(string userId)
        {
            return null;
        }
    }
}
