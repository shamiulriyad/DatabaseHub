using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("CompetitionRegistrations")]
    public class CompetitionRegistration
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CompetitionId { get; set; }

        [Required]
        public int TeamId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CompetitionId")]
        public virtual Competition Competition { get; set; } = null!;

        [ForeignKey("TeamId")]
        public virtual Team Team { get; set; } = null!;
    }
}
