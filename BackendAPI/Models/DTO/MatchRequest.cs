using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models.DTO
{
    // What a brand or agency submits to get their top 5 influencer matches.
    public class MatchRequest
    {
        [Required]
        [MaxLength(200)]
        public string CampaignTitle { get; set; }

        [Required]
        public string CampaignDescription { get; set; }

        // e.g. "Instagram", "TikTok", "YouTube"
        [Required]
        [MaxLength(50)]
        public string TargetPlatform { get; set; }

        // Niche the campaign targets — must match a Niches.Id
        public int? NicheId { get; set; }

        // Market/location the campaign targets — must match a Markets.Id
        public int? MarketId { get; set; }

        [Required]
        public int MinimumFollowers { get; set; }

        [Required]
        public int MaximumFollowers { get; set; }

        public int? AudienceAgeMin { get; set; }
        public int? AudienceAgeMax { get; set; }

        // "Male", "Female", "Any"
        [MaxLength(20)]
        public string? AudienceGender { get; set; }

        // e.g. "Reels", "Posts", "Shorts"
        [MaxLength(100)]
        public string? ContentType { get; set; }

        // Optional — minimum engagement rate required (e.g. 2.5 = 2.5%)
        public decimal? MinEngagementRate { get; set; }

        // Optional — maximum bot score allowed (e.g. 0.2 = max 20% fake followers)
        public decimal? MaxBotScore { get; set; }

        // Optional — save results against an existing campaign
        public Guid? CampaignId { get; set; }

        // Who is making this request
        public Guid? BrandId { get; set; }
        public Guid? AgencyId { get; set; }
    }
}
