using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

// Learning DTOs
public class CourseContentDTO
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; }
    public List<ModuleDTO> Modules { get; set; }
    public decimal ProgressPercentage { get; set; }
    public DateTime? EnrolledAt { get; set; }
}

public class LessonProgressDTO
{
    public int LessonId { get; set; }
    public string LessonTitle { get; set; }
    public bool IsCompleted { get; set; }
    public double ProgressPercentage { get; set; }
    public int TimeSpentMinutes { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class QuizSessionDTO
{
    public int Id { get; set; }
    public int QuizId { get; set; }
    public int UserId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int TimeRemainingSeconds { get; set; }
    public List<QuizQuestionDTO> Questions { get; set; }
}

public class AssignmentResultDTO
{
    public int AssignmentId { get; set; }
    public string AssignmentTitle { get; set; }
    public decimal? Grade { get; set; }
    public string? Feedback { get; set; }
    public bool IsSubmitted { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime DueDate { get; set; }
}

public class NoteDTO
{
    public int Id { get; set; }
    public int LessonId { get; set; }
    public int UserId { get; set; }
    public string Content { get; set; }
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ModifiedAt { get; set; }
}

public class AddNoteDTO
{
    [Required]
    public string Content { get; set; }
    public string? Color { get; set; }
}

public class BookmarkDTO
{
    public int Id { get; set; }
    public int LessonId { get; set; }
    public int UserId { get; set; }
    public string LessonTitle { get; set; }
    public string CourseTitle { get; set; }
    public DateTime BookmarkedAt { get; set; }
}

public class LearningAnalyticsDTO
{
    public int TotalHoursSpent { get; set; }
    public int LessonsCompleted { get; set; }
    public decimal AverageQuizScore { get; set; }
    public int StreakDays { get; set; }
    public List<ProgressPointDTO> ProgressData { get; set; }
}

public class ProgressPointDTO
{
    public DateTime Date { get; set; }
    public int HoursSpent { get; set; }
    public int LessonsCompleted { get; set; }
}

public class ResourceDTO
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string ResourceUrl { get; set; }
    public string ResourceType { get; set; } // PDF, Video, Link, etc.
}

public class FileDTO
{
    public string FileName { get; set; }
    public string FileUrl { get; set; }
    public long FileSizeBytes { get; set; }
}

public class WatchDTO
{
    public int WatchedSeconds { get; set; }
}
