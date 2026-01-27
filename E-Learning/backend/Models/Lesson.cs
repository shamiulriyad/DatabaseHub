using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Lessons")]
    public class Lesson
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Column(TypeName = "text")]
        public string? Content { get; set; }

        [Required]
        public int ModuleId { get; set; }

        [Required]
        public int Order { get; set; }

        [Required]
        [MaxLength(20)]
        public string ContentType { get; set; } = "Text"; // Video, PDF, Slides, Text, ExternalLink, Quiz, Assignment

        // Content URLs
        public string? VideoUrl { get; set; }
        public string? PdfUrl { get; set; }
        public string? SlidesUrl { get; set; }
        public string? ExternalLink { get; set; }
        
        // Video specific
        public int? VideoDuration { get; set; } // in seconds
        public string? VideoProvider { get; set; } // YouTube, Vimeo, Local

        // New fields to support explicit video type + duration naming
        // VideoType: expected values e.g. "YOUTUBE" or "MP4"
        public string? VideoType { get; set; }
        // Duration in seconds (alias for VideoDuration; kept separate for clarity)
        public int? Duration { get; set; }

        // Lesson Settings
        public bool IsPreview { get; set; } = false; // Free preview lesson
        public bool IsRequired { get; set; } = true;
        public int CompletionPoints { get; set; } = 5;

        // Exam Focus
        public bool IsImportantForExam { get; set; } = false;
        public string? ExamNotes { get; set; }

        // Resources
        public string? Attachments { get; set; } // JSON array
        public string? References { get; set; } // JSON array

        // Stats
        public int ViewCount { get; set; } = 0;
        public int CompletionCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("ModuleId")]
        public virtual Module Module { get; set; } = null!;
    }
}