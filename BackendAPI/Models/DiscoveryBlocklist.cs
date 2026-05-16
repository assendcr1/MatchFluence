using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Models
{
    [Index(nameof(InstagramHandle), IsUnique = true)]
    public class DiscoveryBlocklist
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string InstagramHandle { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? BrandName { get; set; }

        [MaxLength(100)]
        public string Reason { get; set; } = "Brand/Company";

        public DateTime BlockedAt { get; set; } = DateTime.UtcNow;
    }
}
