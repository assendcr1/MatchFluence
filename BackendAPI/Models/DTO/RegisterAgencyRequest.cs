using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models.DTO
{
    public class RegisterAgencyRequest
    {
        [Required]
        [MaxLength(200)]
        public string AgencyName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; }

        [MaxLength(200)]
        public string? Website { get; set; }
    }
}
