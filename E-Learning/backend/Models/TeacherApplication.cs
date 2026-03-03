using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    [Index(nameof(IdNumber), IsUnique = true)]
    [Table("TeacherApplications")]
    public class TeacherApplication
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [MaxLength(500)]
        public string ReasonForApplying { get; set; } = null!;

        [MaxLength(1000)]
        public string? QualificationDetails { get; set; }

        [MaxLength(500)]
        public string? ExperienceArea { get; set; }

        [Required]
        [MaxLength(50)]
        public string IdType { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string IdNumber { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string IdFrontImagePath { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string IdBackImagePath { get; set; } = null!;

        // Application Status: Pending, Approved, Rejected
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedDate { get; set; }

        [MaxLength(100)]
        public int? ReviewedByAdminId { get; set; }

        [ForeignKey("ReviewedByAdminId")]
        public User? ReviewedByAdmin { get; set; }

        [MaxLength(500)]
        public string? AdminRemarks { get; set; }

        public DateTime? ApprovedDate { get; set; }
    }
}
