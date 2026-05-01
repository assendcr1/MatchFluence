using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    // Written every 24hrs by the background refresh service.
    // Stores a point-in-time snapshot of an influencer's key metrics
    // so you can show growth trends over time.
    public class MetricSnapshot
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid InfluencerId { get; set; }
        [ForeignKey(nameof(InfluencerId))]
        public Influencer Influencer { get; set; }

        public int FollowerCount { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal EngagementRate { get; set; }

        // Reach from last 30 days of posts
        public int AverageReach { get; set; }

        // Estimated % of followers that are bots/fake (0.0000 to 1.0000)
        [Column(TypeName = "decimal(5,4)")]
        public decimal BotScore { get; set; }

        public DateTime SnapshotDate { get; set; } = DateTime.UtcNow;
    }
}
