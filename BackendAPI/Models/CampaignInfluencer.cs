using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    // Junction table — replaces the single InfluencerId FK on Campaign.
    // One campaign can have up to 5 matched influencers, each with a score and status.
    public class CampaignInfluencer
    {
        // Composite PK configured in ApplicationDbContext
        public Guid CampaignId { get; set; }
        [ForeignKey(nameof(CampaignId))]
        public Campaign Campaign { get; set; }

        public Guid InfluencerId { get; set; }
        [ForeignKey(nameof(InfluencerId))]
        public Influencer Influencer { get; set; }

        // 0–100 score from matching engine
        public int MatchScore { get; set; }

        // AI-generated explanation of why this is a match
        public string? MatchReason { get; set; }

        // Matched / Contacted / Accepted / Rejected
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Matched";

        public DateTime MatchedAt { get; set; } = DateTime.UtcNow;
    }
}
