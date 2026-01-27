using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("StudentLessonProgresses")]
    public class StudentLessonProgress
    {
        [Key]
        public int Id { get; set; }

        // Reference to the student (User)
        public int UserId { get; set; }

        // Reference to the lesson
        public int LessonId { get; set; }

        // Watched seconds for the lesson
        public int WatchedSeconds { get; set; } = 0;

        // Whether the lesson is considered completed
        public bool IsCompleted { get; set; } = false;

        // When the lesson was completed
        public DateTime? CompletedAt { get; set; }

        // Last time the student watched this lesson
        public DateTime? LastWatchedAt { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public Lesson? Lesson { get; set; }
    }
}
