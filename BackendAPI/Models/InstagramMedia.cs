using System.Text.Json.Serialization;

namespace BackendAPI.Models
{
    // Maps each item in the data[] array from GET /{user-id}/media?fields=...
    // JsonPropertyName attributes required — Graph API returns snake_case.
    public class InstagramMedia
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("caption")]
        public string? Caption { get; set; }

        [JsonPropertyName("media_type")]
        public string MediaType { get; set; }

        [JsonPropertyName("media_url")]
        public string? MediaUrl { get; set; }

        [JsonPropertyName("permalink")]
        public string? Permalink { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; }

        [JsonPropertyName("like_count")]
        public int LikeCount { get; set; }

        [JsonPropertyName("comments_count")]
        public int CommentsCount { get; set; }
    }
}
