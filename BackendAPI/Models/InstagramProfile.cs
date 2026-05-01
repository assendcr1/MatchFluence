using System.Text.Json.Serialization;

namespace BackendAPI.Models
{
    // Maps the response from GET /{user-id}?fields=id,username,name,...
    // JsonPropertyName attributes required — Graph API returns snake_case
    // and System.Text.Json is case-sensitive by default.
    public class InstagramProfile
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("profile_picture_url")]
        public string? ProfilePictureUrl { get; set; }

        [JsonPropertyName("website")]
        public string? Website { get; set; }

        [JsonPropertyName("followers_count")]
        public int FollowersCount { get; set; }

        [JsonPropertyName("follows_count")]
        public int FollowsCount { get; set; }

        [JsonPropertyName("media_count")]
        public int MediaCount { get; set; }
    }
}
