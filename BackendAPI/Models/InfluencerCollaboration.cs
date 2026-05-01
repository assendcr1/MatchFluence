using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    // Replaces the PreviousCollaborations string[] JSON column on Influencer.
    // Stored as a proper table so you can query "has this influencer worked
    // with a competitor brand?" for exclusivity detection.
    public class InfluencerCollaboration
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid InfluencerId { get; set; }
        [ForeignKey(nameof(InfluencerId))]
        public Influencer Influencer { get; set; }

        [Required]
        [MaxLength(200)]
        public string BrandName { get; set; }

        // e.g. "Fashion", "Tech", "Food & Beverage"
        [MaxLength(100)]
        public string? Category { get; set; }

        public DateTime? CollabDate { get; set; }

        // Optional — what the campaign produced
        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
