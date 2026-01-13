using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ClanJoinRequests")]
    public class ClanJoinRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClanId { get; set; }

        [Required]
        public int UserId { get; set; }

        [MaxLength(500)]
        public string? Message { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
        public int? ReviewedByUserId { get; set; }

        // Navigation
        [ForeignKey("ClanId")]
        public virtual Clan Clan { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
