using BackendAPI.Models;
using System.Text.Json;

namespace BackendAPI.Services
{
    public class InstagramService : IInstagramService
    {
        private readonly HttpClient _httpClient;
        private readonly string _accessToken;
        private readonly ILogger<InstagramService> _logger;

        // Shared deserialiser options — case-insensitive to handle
        // the Graph API's snake_case field names
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public InstagramService(HttpClient httpClient, IConfiguration config, ILogger<InstagramService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;

            _accessToken = config["InstagramSettings:AccessToken"]
                ?? throw new InvalidOperationException(
                    "InstagramSettings:AccessToken is not configured. " +
                    "Add it to appsettings.json or user secrets.");
        }

        public async Task<InstagramProfile> GetProfileAsync(string userId)
        {
            string url = $"https://graph.facebook.com/v19.0/{userId}" +
                         $"?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count" +
                         $"&access_token={_accessToken}";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Instagram API error fetching profile for {UserId}: {StatusCode}",
                    userId, response.StatusCode);
                throw new Exception($"Instagram API error: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var profile = JsonSerializer.Deserialize<InstagramProfile>(content, _jsonOptions);

            return profile ?? throw new Exception($"Failed to deserialise profile for {userId}");
        }

        public async Task<List<InstagramMedia>> GetMediaAsync(string userId)
        {
            string url = $"https://graph.facebook.com/v19.0/{userId}/media" +
                         $"?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count" +
                         $"&access_token={_accessToken}";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Instagram API error fetching media for {UserId}: {StatusCode}",
                    userId, response.StatusCode);
                throw new Exception($"Instagram API error: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var responseObject = JsonSerializer.Deserialize<MediaResponse>(content, _jsonOptions);

            return responseObject?.Data ?? new List<InstagramMedia>();
        }

        // Fixed — was returning raw string JSON
        public async Task<MediaInsights?> GetMediaInsightsAsync(string mediaId)
        {
            try
            {
                string url = $"https://graph.facebook.com/{mediaId}/insights" +
                             $"?metric=impressions,reach,engagement,saved,video_views,replies" +
                             $"&access_token={_accessToken}";

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Instagram API error fetching media insights for {MediaId}: {StatusCode}",
                        mediaId, response.StatusCode);
                    return null;
                }

                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<MediaInsights>(content, _jsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception fetching media insights for {MediaId}", mediaId);
                return null;
            }
        }

        // Fixed — was returning raw string JSON
        public async Task<AccountInsights?> GetAccountInsightsAsync(string userId)
        {
            try
            {
                string url = $"https://graph.facebook.com/{userId}/insights" +
                             $"?metric=impressions,reach,profile_views,website_clicks" +
                             $"&access_token={_accessToken}";

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Instagram API error fetching account insights for {UserId}: {StatusCode}",
                        userId, response.StatusCode);
                    return null;
                }

                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<AccountInsights>(content, _jsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception fetching account insights for {UserId}", userId);
                return null;
            }
        }
    }
}
