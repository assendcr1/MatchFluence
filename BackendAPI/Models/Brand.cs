using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Index(nameof(Email), IsUnique = true)]
    public class Brand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string CompanyName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; }

        [MaxLength(100)]
        public string? Industry { get; set; }

        [MaxLength(200)]
        public string? Website { get; set; }

        // Stored as SHA256 hash — never store the raw key
        [Required]
        public string ApiKeyHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation — campaigns this brand has created
        public ICollection<Campaign> Campaigns { get; set; }
            = new List<Campaign>();
    }
}
