using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models
{
    public class Report
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid CampaignId { get; set; }

        [Required]
        public Guid InfluencerId { get; set; }

        // "Email" or "DM"
        [Required]
        [MaxLength(20)]
        public string MessageType { get; set; }

        [MaxLength(200)]
        public string? Subject { get; set; }

        [Required]
        public string MessageBody { get; set; }

        public bool IsCustomMessage { get; set; }

        // Always UTC
        public DateTime SentDate { get; set; } = DateTime.UtcNow;

        // "Sent", "Failed", "Pending"
        [Required]
        [MaxLength(20)]
        public string Status { get; set; }
    }
}
