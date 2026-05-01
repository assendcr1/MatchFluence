using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Index(nameof(NicheName), IsUnique = true)]
    public class Niches
    {
        /// <summary>
        /// The unique identifier for Niches
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// Niche Name
        /// </summary>
        [Required]
        [StringLength(50)]
        public string NicheName { get; set; }
    }
}
