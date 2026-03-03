using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Posts")]
    public class Post
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        [Column(TypeName = "text")]
        public string Content { get; set; } = null!;

        [Required]
        public int UserId { get; set; }

        // Post can be in different contexts (Multi-level community)
        public int? UniversityId { get; set; }
        public int? DepartmentId { get; set; }
        public int? CourseId { get; set; }
        public int? ClanId { get; set; }

        [Required]
        [MaxLength(20)]
        public string PostType { get; set; } = "Discussion"; // Discussion, Question, Announcement, Resource, ExamTip, Doubt

        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = "public_post"; // admin_forum | public_post

        // Exam-focused posts
        public bool IsExamRelated { get; set; } = false;
        public string? ExamTags { get; set; } // JSON array
        public string? Subject { get; set; }

        // Media
        public string? MediaUrl { get; set; }
        public string? MediaType { get; set; } // Image, Video, PDF

        // Optional section marker to scope posts to a specific area (e.g. AdminForum)
        [MaxLength(50)]
        public string? SectionType { get; set; }

        // Stats for Ranking
        public int UpvoteCount { get; set; } = 0;
        public int DownvoteCount { get; set; } = 0;
        public int CommentCount { get; set; } = 0;
        public int ViewCount { get; set; } = 0;
        public int ShareCount { get; set; } = 0;

        // Moderation
        public bool IsPinned { get; set; } = false;
        public bool IsClosed { get; set; } = false;
        public bool IsReported { get; set; } = false;
        public int ReportCount { get; set; } = 0;

        // Best Answer (for questions)
        public int? BestAnswerId { get; set; }

        // Teacher verified answer
        public bool HasTeacherAnswer { get; set; } = false;
        public int? TeacherAnswerId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastActivity { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("UniversityId")]
        public virtual University? University { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }

        [ForeignKey("CourseId")]
        public virtual Course? Course { get; set; }

        [ForeignKey("ClanId")]
        public virtual Clan? Clan { get; set; }

        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<PostVote> Votes { get; set; } = new List<PostVote>();
    }
}