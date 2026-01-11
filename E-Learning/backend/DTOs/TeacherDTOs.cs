using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Apply to become a teacher
    public class ApplyTeacherDTO
    {
        [Required]
        [MaxLength(500)]
        public string ReasonForApplying { get; set; } = null!;

        [MaxLength(1000)]
        public string? QualificationDetails { get; set; }

        [MaxLength(500)]
        public string? ExperienceArea { get; set; }
    }

    // Teacher Application Response
    public class TeacherApplicationDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string ReasonForApplying { get; set; } = null!;
        public string? QualificationDetails { get; set; }
        public string? ExperienceArea { get; set; }
        public string Status { get; set; } = null!;
        public DateTime ApplicationDate { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public int? ReviewedByAdminId { get; set; }
        public string? AdminRemarks { get; set; }
        public DateTime? ApprovedDate { get; set; }
    }

    // Admin Review Response
    public class ReviewTeacherApplicationDTO
    {
        [Required]
        public int ApplicationId { get; set; }

        [Required]
        [RegularExpression("^(Approved|Rejected)$")]
        public string Decision { get; set; } = null!; // "Approved" or "Rejected"

        [MaxLength(500)]
        public string? AdminRemarks { get; set; }
    }

    // Teacher Application List Response (for admin dashboard)
    public class TeacherApplicationListDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string ApplicantName { get; set; } = null!;
        public string ApplicantEmail { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime ApplicationDate { get; set; }
        public string ReasonForApplying { get; set; } = null!;
        public string? ExperienceArea { get; set; }
        public string? QualificationDetails { get; set; }
    }
}
