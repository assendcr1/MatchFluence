using System.Text.Json.Serialization;

namespace BackendAPI.Models
{
    // Maps the insights response from GET /{media-id}/insights?metric=...
    // JsonPropertyName attributes required — Graph API returns snake_case.
    public class MediaInsights
    {
        [JsonPropertyName("media_id")]
        public string MediaId { get; set; } = string.Empty;

        // Unique accounts that saw the post
        [JsonPropertyName("reach")]
        public int Reach { get; set; }

        // Total times the post was displayed (one account can contribute many)
        [JsonPropertyName("impressions")]
        public int Impressions { get; set; }

        // Likes + comments + saves + shares combined
        [JsonPropertyName("engagement")]
        public int Engagement { get; set; }

        // Accounts that bookmarked this post
        [JsonPropertyName("saved")]
        public int Saved { get; set; }

        // Video/Reel plays — not guaranteed, may be null
        [JsonPropertyName("video_views")]
        public int? VideoViews { get; set; }

        // Stories only — replies on this story — not guaranteed
        [JsonPropertyName("replies")]
        public int? Replies { get; set; }
    }
}
