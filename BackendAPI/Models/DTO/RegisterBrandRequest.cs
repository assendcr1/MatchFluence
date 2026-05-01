using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models.DTO
{
    public class RegisterBrandRequest
    {
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
    }
}
