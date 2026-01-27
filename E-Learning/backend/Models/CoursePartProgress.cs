using System;

namespace backend.Models
{
    public class CoursePartProgress
    {
        public int Id { get; set; }
        public int EnrollmentId { get; set; }
        public int CoursePartId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public double ProgressPercentage { get; set; }
        public int TimeSpentMinutes { get; set; }

        public Enrollment? Enrollment { get; set; }
        public CoursePart? CoursePart { get; set; }
    }
}
