using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Index(nameof(Title), IsUnique = true)]
    public class Campaign
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string TargetPlatform { get; set; }

        // Fixed typo from "AudienceAgeMini"
        [Required]
        public int AudienceAgeMin { get; set; }

        [Required]
        public int AudienceAgeMax { get; set; }

        [MaxLength(20)]
        public string? AudienceGender { get; set; }

        [MaxLength(100)]
        public string? ContentType { get; set; }

        // Fixed from string to int
        public int MinimumFollowers { get; set; }

        // Fixed from string to int
        public int MaximumFollowers { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly EndDate { get; set; }

        // Added — niche targeting for matching
        public int? NicheId { get; set; }
        [ForeignKey(nameof(NicheId))]
        public Niches? Niche { get; set; }

        // Added — market/location targeting for matching
        public int? MarketId { get; set; }
        [ForeignKey(nameof(MarketId))]
        public Markets? Market { get; set; }

        // Added — who created this campaign
        public Guid? CreatedByBrandId { get; set; }
        [ForeignKey(nameof(CreatedByBrandId))]
        public Brand? CreatedByBrand { get; set; }

        public Guid? CreatedByAgencyId { get; set; }
        [ForeignKey(nameof(CreatedByAgencyId))]
        public Agency? CreatedByAgency { get; set; }

        // Navigation — top 5 matched influencers with scores
        public ICollection<CampaignInfluencer> MatchedInfluencers { get; set; }
            = new List<CampaignInfluencer>();
    }
}
