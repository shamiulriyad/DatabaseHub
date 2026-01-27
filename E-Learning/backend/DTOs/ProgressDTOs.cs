using System;

namespace backend.DTOs
{
    public class WatchRequestDTO
    {
        public int WatchedSeconds { get; set; }
    }

    public class LessonStatusDTO
    {
        public int LessonId { get; set; }
        public string Title { get; set; } = null!;
        public int WatchedSeconds { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
