using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Index(nameof(DisplayName), IsUnique = true)]
    [Index(nameof(InstagramHandle))]
    public class Influencer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [MaxLength(100)]
        public string DisplayName { get; set; }

        [MaxLength(50)]
        public string Platform { get; set; }

        public int NicheId { get; set; }
        [ForeignKey(nameof(NicheId))]
        public Niches? Niche { get; set; }

        public int MarketId { get; set; }
        [ForeignKey(nameof(MarketId))]
        public Markets? Market { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal EngagementRate { get; set; }

        public int FollowerCount { get; set; }

        [Column(TypeName = "decimal(5,4)")]
        public decimal BotScore { get; set; }

        public DateTime LastDataRefresh { get; set; } = DateTime.UtcNow;

        // "High" or "Low" — controls refresh frequency (24hr vs 72hr)
        [MaxLength(10)]
        public string RefreshPriority { get; set; } = "Low";

        // How this influencer was discovered
        [MaxLength(50)]
        public string? DiscoverySource { get; set; }

        // The seed influencer that led to this discovery
        public Guid? DiscoveredFromInfluencerId { get; set; }

        public bool IsVerified { get; set; } = false;

        // Next scheduled refresh — set based on priority tier
        public DateTime NextRefreshDue { get; set; } = DateTime.UtcNow;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; }

        [MaxLength(150)]
        public string? InstagramHandle { get; set; }

        [MaxLength(150)]
        public string? TwitterHandle { get; set; }

        [MaxLength(150)]
        public string? TikTokHandle { get; set; }

        [MaxLength(150)]
        public string? YouTubeHandle { get; set; }

        public string? AccessToken { get; set; }
        public DateTime? TokenExpiry { get; set; }

        public ICollection<InfluencerCollaboration> PreviousCollaborations { get; set; }
            = new List<InfluencerCollaboration>();

        public ICollection<CampaignInfluencer> Campaigns { get; set; }
            = new List<CampaignInfluencer>();

        public ICollection<MetricSnapshot> MetricSnapshots { get; set; }
            = new List<MetricSnapshot>();
    }
}
