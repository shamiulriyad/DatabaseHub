// DTOs/ModuleDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Module Create
    public class ModuleCreateDTO
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public int CourseId { get; set; }

        [Required]
        public int Order { get; set; }

        public int EstimatedDuration { get; set; } = 0;
        public string? LearningObjectives { get; set; }
        public bool IsRequired { get; set; } = true;
        public int CompletionPoints { get; set; } = 10;
    }

    // Module Update
    public class ModuleUpdateDTO
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }
        public int? Order { get; set; }
        public int? EstimatedDuration { get; set; }
        public string? LearningObjectives { get; set; }
        public bool? IsRequired { get; set; }
        public int? CompletionPoints { get; set; }
    }

    // Module Response
    public class ModuleDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int CourseId { get; set; }
        public int Order { get; set; }
        public int EstimatedDuration { get; set; }
        public bool HasVideo { get; set; }
        public bool HasPDF { get; set; }
        public bool HasSlides { get; set; }
        public bool HasQuiz { get; set; }
        public bool HasAssignment { get; set; }
        public bool IsRequired { get; set; }
        public int CompletionPoints { get; set; }
        public int TotalLessons { get; set; }
        public bool IsCompleted { get; set; }
        public decimal ProgressPercentage { get; set; }
        public List<LessonDTO> Lessons { get; set; }
        public List<QuizDTO> Quizzes { get; set; }
        public List<AssignmentDTO> Assignments { get; set; }
    }

    // Lesson Create
    public class LessonCreateDTO
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string? Content { get; set; }

        [Required]
        public int ModuleId { get; set; }

        [Required]
        public int Order { get; set; }

        [Required]
        [MaxLength(20)]
        public string ContentType { get; set; } = "Text";

        public string? VideoUrl { get; set; }
        public string? PdfUrl { get; set; }
        public string? SlidesUrl { get; set; }
        public string? ExternalLink { get; set; }
        public int? VideoDuration { get; set; }
        public string? VideoProvider { get; set; }
        public bool IsPreview { get; set; } = false;
        public bool IsRequired { get; set; } = true;
        public int CompletionPoints { get; set; } = 5;
        public bool IsImportantForExam { get; set; } = false;
        public string? ExamNotes { get; set; }
        public List<string>? Attachments { get; set; }
        public List<string>? References { get; set; }
    }

    // Lesson Update
    public class LessonUpdateDTO
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Content { get; set; }
        public int? Order { get; set; }
        public string? ContentType { get; set; }
        public string? VideoUrl { get; set; }
        public string? PdfUrl { get; set; }
        public string? SlidesUrl { get; set; }
        public string? ExternalLink { get; set; }
        public int? VideoDuration { get; set; }
        public bool? IsPreview { get; set; }
        public bool? IsRequired { get; set; }
        public int? CompletionPoints { get; set; }
        public bool? IsImportantForExam { get; set; }
        public string? ExamNotes { get; set; }
    }

    // Lesson Response
    public class LessonDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Content { get; set; }
        public int ModuleId { get; set; }
        public int Order { get; set; }
        public string ContentType { get; set; }
        public string? VideoUrl { get; set; }
        public string? PdfUrl { get; set; }
        public string? SlidesUrl { get; set; }
        public string? ExternalLink { get; set; }
        public int? VideoDuration { get; set; }
        public string? VideoProvider { get; set; }
        public bool IsPreview { get; set; }
        public bool IsRequired { get; set; }
        public int CompletionPoints { get; set; }
        public bool IsImportantForExam { get; set; }
        public string? ExamNotes { get; set; }
        public List<string> Attachments { get; set; }
        public List<string> References { get; set; }
        public int ViewCount { get; set; }
        public int CompletionCount { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool HasNextLesson { get; set; }
        public bool HasPreviousLesson { get; set; }
        public int? NextLessonId { get; set; }
        public int? PreviousLessonId { get; set; }
        public string? NextLessonTitle { get; set; }
        public string? PreviousLessonTitle { get; set; }
        // Enrollment context for the current user (populated when fetching lesson in LearningService)
        public int? EnrollmentId { get; set; }
        // Overall course progress for the enrollment (percentage)
        public double? CourseProgress { get; set; }
    }
}