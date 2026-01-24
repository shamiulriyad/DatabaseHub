using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Courses")]
    public class Course
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string ShortDescription { get; set; } = null!;

        [Required]
        [Column(TypeName = "text")]
        public string FullDescription { get; set; } = null!;

        // University → Department → Course Hierarchy
        [Required]
        public int UniversityId { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        public int TeacherId { get; set; }

        [Required]
        [MaxLength(50)]
        public string CourseCode { get; set; } = null!; // Example: CSE101, BBA201

        [Required]
        [MaxLength(50)]
        public string CourseType { get; set; } = null!; // CSE, BBA, EEE, etc.

        // Exam-focused learning (প্রধান ফিচার)
        [Column(TypeName = "text")]
        public string? ExamFocus { get; set; }
        public string? ExamPattern { get; set; } // MCQ, Written, Practical
        public string? ImportantTopics { get; set; } // JSON array
        public string? PreviousQuestions { get; set; } // JSON array

        // Pricing
        public bool IsFree { get; set; } = true;
        public decimal? Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public decimal? PlatformCommission { get; set; } = 10; // 10% default
        public decimal? TeacherEarning { get; set; }

        // Learning Details
        public int TotalModules { get; set; } = 0;
        public int TotalLessons { get; set; } = 0;
        public int TotalQuizzes { get; set; } = 0;
        public int TotalAssignments { get; set; } = 0;
        public int DurationHours { get; set; } = 0; // Total course duration
        
        [Required]
        [MaxLength(20)]
        public string DifficultyLevel { get; set; } = "Beginner"; // Beginner, Intermediate, Advanced

        // Media
        public string? ThumbnailUrl { get; set; }
        public string? PreviewVideoUrl { get; set; }
        public string? CourseMaterials { get; set; } // JSON array of materials

        // Status & Approval
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Published, Draft
        public int? ApprovedBy { get; set; } // Admin ID
        public DateTime? ApprovedAt { get; set; }
        public string? RejectionReason { get; set; }

        // Stats for Ranking
        public int EnrollmentCount { get; set; } = 0;
        public double AverageRating { get; set; } = 0;
        public int TotalReviews { get; set; } = 0;
        public int TotalCompleted { get; set; } = 0;
        public int TotalQuizAttempts { get; set; } = 0;
        public int TotalAssignmentSubmissions { get; set; } = 0;

        // Course Schedule
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsSelfPaced { get; set; } = true;

        // SEO & Discovery
        public string? Tags { get; set; } // JSON array
        public string? Keywords { get; set; }
        public int ViewCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }

        // Navigation Properties
        [ForeignKey("UniversityId")]
        public virtual University University { get; set; } = null!;

        [ForeignKey("DepartmentId")]
        public virtual Department Department { get; set; } = null!;

        [ForeignKey("TeacherId")]
        public virtual User Teacher { get; set; } = null!;

        [ForeignKey("ApprovedBy")]
        public virtual User? Approver { get; set; }

        public virtual ICollection<Module> Modules { get; set; } = new List<Module>();
        public virtual ICollection<CoursePart> CourseParts { get; set; } = new List<CoursePart>();
        public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
        public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        public virtual ICollection<Competition> Competitions { get; set; } = new List<Competition>();
    }
}