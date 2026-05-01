using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Index(nameof(MarketName), IsUnique = true)]
    public class Markets
    {
        /// <summary>
        /// The unique identifier for Markets
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// Market name
        /// </summary>
        [Required]
        [StringLength(50)]
        public string MarketName { get; set; }
    }
}
