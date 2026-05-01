using System.Text.Json.Serialization;

namespace BackendAPI.Models
{
    // Maps the account-level insights from GET /{user-id}/insights?metric=...
    // JsonPropertyName attributes required — Graph API returns snake_case.
    public class AccountInsights
    {
        [JsonPropertyName("reach")]
        public int Reach { get; set; }

        [JsonPropertyName("impressions")]
        public int Impressions { get; set; }

        [JsonPropertyName("profile_views")]
        public int ProfileViews { get; set; }

        [JsonPropertyName("website_clicks")]
        public int? WebsiteClicks { get; set; }

        [JsonPropertyName("follower_count")]
        public int FollowerCount { get; set; }

        // Audience breakdown by age range e.g. {"18-24": 1200, "25-34": 3400}
        [JsonPropertyName("audience_gender_age")]
        public Dictionary<string, int> AudienceByAge { get; set; } = new();

        [JsonPropertyName("audience_city")]
        public Dictionary<string, int> AudienceByCity { get; set; } = new();

        [JsonPropertyName("audience_country")]
        public Dictionary<string, int> AudienceByCountry { get; set; } = new();
    }
}
