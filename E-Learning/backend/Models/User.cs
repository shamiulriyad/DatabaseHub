using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = null!;

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = null!;

        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }

        // Dynamic Role System (যেকোনো সময় রোল পরিবর্তনযোগ্য)
        public bool IsStudent { get; set; } = true;
        public bool IsTeacher { get; set; } = false;        public bool TeacherPendingApproval { get; set; } = false;
        public DateTime? TeacherRequestDate { get; set; }        public bool IsCompetitor { get; set; } = false;
        public bool IsAdmin { get; set; } = false;

        // Ranking System
        public int TotalPoints { get; set; } = 0;
        public int CurrentRank { get; set; } = 0;
        public string? Badges { get; set; } // JSON array

        // Academic Stats
        public int TotalCoursesEnrolled { get; set; } = 0;
        public int TotalCoursesCompleted { get; set; } = 0;
        public decimal AverageGrade { get; set; } = 0;
        public int TotalQuizzesTaken { get; set; } = 0;
        public int TotalAssignmentsSubmitted { get; set; } = 0;

        // Activity Tracking
        public int StreakDays { get; set; } = 0;
        public DateTime? LastActive { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        // Password Reset
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }

        // Navigation Properties
        public virtual ICollection<Course> CreatedCourses { get; set; } = new List<Course>();
        public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public virtual ICollection<QuizSubmission> QuizSubmissions { get; set; } = new List<QuizSubmission>();
        public virtual ICollection<AssignmentSubmission> AssignmentSubmissions { get; set; } = new List<AssignmentSubmission>();
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<ClanMember> ClanMemberships { get; set; } = new List<ClanMember>();
        public virtual ICollection<CompetitionParticipant> CompetitionParticipations { get; set; } = new List<CompetitionParticipant>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}