// DTOs/EnrollmentDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Enrollment Create
    public class EnrollmentCreateDTO
    {
        [Required]
        public int CourseId { get; set; }

        [MaxLength(20)]
        public string EnrollmentType { get; set; } = "Student";
        
        public DateTime? ExpiryDate { get; set; }
    }

    // Progress Update
    public class UpdateProgressDTO
    {
        [Range(0, 100)]
        public decimal ProgressPercentage { get; set; }
        
        public int? CompletedLessons { get; set; }
        public int? TotalLessons { get; set; }
        public int? CompletedModules { get; set; }
        public int? TotalModules { get; set; }
        public DateTime? LastAccessed { get; set; }
    }

    // Enrollment Response
    public class EnrollmentDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public string CourseThumbnail { get; set; }
        // Banner image for course cards
        public string? CourseBannerUrl { get; set; }
        // Instructor info for frontend display
        public string? Instructor { get; set; }
        public string? InstructorAvatar { get; set; }
        public string EnrollmentType { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? LastAccessed { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
        // Backup source from Course in case enrollment record missing totals
        public int CourseTotalLessons { get; set; }
        public int CompletedModules { get; set; }
        public int TotalModules { get; set; }
        public decimal ProgressPercentage { get; set; }
        public decimal? QuizAverage { get; set; }
        public decimal? AssignmentAverage { get; set; }
        public decimal? FinalGrade { get; set; }
        public string? GradeLetter { get; set; }
        public int PointsEarned { get; set; }
        public string Status { get; set; }
        public decimal? AmountPaid { get; set; }
        public string? PaymentStatus { get; set; }
        public bool CertificateEarned { get; set; }
        public string? CertificateUrl { get; set; }
    }

    // Enrollment Detail
    public class EnrollmentDetailDTO : EnrollmentDTO
    {
        public CourseDTO Course { get; set; }
        public UserDTO User { get; set; }
        public List<ModuleProgressDTO> ModuleProgress { get; set; }
        public List<QuizResultDTO> QuizResults { get; set; }
        public List<AssignmentResultDTO> AssignmentResults { get; set; }
        public EnrollmentStatsDTO Stats { get; set; }
    }

    // Enrollment Response (lightweight)
    public class EnrollmentResponseDTO
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public string? CourseBannerUrl { get; set; }
        public string? Instructor { get; set; }
        public string? InstructorAvatar { get; set; }
        public string? UniversityName { get; set; }
        public string? DepartmentName { get; set; }
        public DateTime EnrolledAt { get; set; }
        public float ProgressPercentage { get; set; }
        public bool IsActive { get; set; }
        public DateTime LastAccessedAt { get; set; }
    }

    // Module Progress
    public class ModuleProgressDTO
    {
        public int ModuleId { get; set; }
        public string ModuleTitle { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
        public decimal ProgressPercentage { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    // Enrollment Stats
    public class EnrollmentStatsDTO
    {
        public int TotalEnrollments { get; set; }
        public int ActiveEnrollments { get; set; }
        public int CompletedEnrollments { get; set; }
        public decimal AverageProgress { get; set; }
        public decimal AverageGrade { get; set; }
        public decimal CompletionRate { get; set; }
        public int TotalPointsEarned { get; set; }
        public Dictionary<string, int> StatusDistribution { get; set; }
    }

    // Student Progress
    public class StudentProgressDTO
    {
        public UserDTO Student { get; set; }
        public EnrollmentDTO Enrollment { get; set; }
        public List<ModuleProgressDTO> ModuleProgress { get; set; }
        public List<QuizResultDTO> QuizResults { get; set; }
        public List<AssignmentResultDTO> AssignmentResults { get; set; }
        public StudentActivityDTO Activity { get; set; }
    }

    // Student Activity
    public class StudentActivityDTO
    {
        public DateTime? LastLogin { get; set; }
        public DateTime? LastActivity { get; set; }
        public int TotalLogins { get; set; }
        public int TotalTimeSpent { get; set; } // in minutes
        public int TotalQuizzesTaken { get; set; }
        public int TotalAssignmentsSubmitted { get; set; }
        public int ForumPosts { get; set; }
        public int ForumComments { get; set; }
    }
}