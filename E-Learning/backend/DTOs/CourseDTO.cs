// DTOs/CourseDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Course Create
    public class CourseCreateDTO
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        [MaxLength(500)]
        public string ShortDescription { get; set; }

        [Required]
        public string FullDescription { get; set; }

        [Required]
        public int UniversityId { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        [MaxLength(50)]
        public string CourseCode { get; set; }

        [Required]
        [MaxLength(50)]
        public string CourseType { get; set; }

        // Exam Focus
        public string? ExamFocus { get; set; }
        public string? ExamPattern { get; set; }
        public string? ImportantTopics { get; set; }
        public string? PreviousQuestions { get; set; }

        // Pricing
        public bool IsFree { get; set; } = true;
        public decimal? Price { get; set; }
        public decimal? DiscountPrice { get; set; }

        // Learning Details
        public int DurationHours { get; set; } = 0;
        
        [Required]
        [MaxLength(20)]
        public string DifficultyLevel { get; set; } = "Beginner";

        // Media
        public string? ThumbnailUrl { get; set; }
        // Legacy single-preview support
        public string? PreviewVideoUrl { get; set; }
        // Optional list of video parts for the course (part-wise content)
        public List<CoursePartCreateDTO>? VideoParts { get; set; }
        public string? CourseMaterials { get; set; }

        // Schedule
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsSelfPaced { get; set; } = true;

        // SEO
        public string? Tags { get; set; }
        public string? Keywords { get; set; }

        // Requirements
        public string? Prerequisites { get; set; }
        public string? LearningOutcomes { get; set; }
        public string? TargetAudience { get; set; }
    }

    // Course Update
    public class CourseUpdateDTO
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(500)]
        public string? ShortDescription { get; set; }

        public string? FullDescription { get; set; }
        public string? ExamFocus { get; set; }
        public string? ExamPattern { get; set; }
        public string? ImportantTopics { get; set; }
        public bool? IsFree { get; set; }
        public decimal? Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string? DifficultyLevel { get; set; }
        public string? ThumbnailUrl { get; set; }
        // Legacy single-preview support
        public string? PreviewVideoUrl { get; set; }
        // Provide the full set of parts to replace existing parts, or omit to leave parts unchanged
        public List<CoursePartUpdateDTO>? VideoParts { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsSelfPaced { get; set; }
        public string? Tags { get; set; }
    }

    // Course Status Update
    public class UpdateCourseStatusDTO
    {
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } // Approve, Reject, Publish

        [MaxLength(500)]
        public string? Reason { get; set; }
    }

    // Course Response
    public class CourseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string FullDescription { get; set; }
        public string ShortDescription { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int UniversityId { get; set; }
        public string UniversityName { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int TeacherId { get; set; }
        public string TeacherName { get; set; }
        public string CourseCode { get; set; }
        public string CourseType { get; set; }
        public bool IsFree { get; set; }
        public decimal? Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public int DurationHours { get; set; }
        public string DifficultyLevel { get; set; }
        public int EnrollmentCount { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public bool IsEnrolled { get; set; }
        public decimal? ProgressPercentage { get; set; }
    }

    // Course Detail
    public class CourseDetailDTO : CourseDTO
    {
        public int? EnrollmentId { get; set; }
        public string? ExamFocus { get; set; }
        public string? ExamPattern { get; set; }
        public string? ImportantTopics { get; set; }
        public string? PreviousQuestions { get; set; }
        public string? PreviewVideoUrl { get; set; }
        public List<CoursePartDTO> VideoParts { get; set; } = new List<CoursePartDTO>();
        public string? CourseMaterials { get; set; }
        public TeacherDTO Teacher { get; set; }
        public UniversityDTO University { get; set; }
        public DepartmentDTO Department { get; set; }
        public int TotalModules { get; set; }
        public int TotalLessons { get; set; }
        public int TotalCompleted { get; set; }
        public List<ModuleDTO> Modules { get; set; }
        public List<ReviewDTO> Reviews { get; set; }
        public List<FAQDTO> FAQs { get; set; }
        public CourseStatsDTO Stats { get; set; }
        public List<string> Tags { get; set; }
        public List<string> Prerequisites { get; set; }
        public List<string> LearningOutcomes { get; set; }
        public List<string> TargetAudience { get; set; }
        public bool IsTeacher { get; set; }
        public bool CanEdit { get; set; }
    }

    // Course part DTOs
    public class CoursePartCreateDTO
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? VideoUrl { get; set; }
        public string? YouTubeUrl { get; set; }
        public int Order { get; set; }
        public bool IsPreview { get; set; }
        // duration in seconds (optional)
        public int? DurationSeconds { get; set; }
    }

    public class CoursePartUpdateDTO : CoursePartCreateDTO
    {
        public int? Id { get; set; }
    }

    public class CoursePartDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? VideoUrl { get; set; }
        public string? YouTubeUrl { get; set; }
        public int Order { get; set; }
        public bool IsPreview { get; set; }
        public int DurationSeconds { get; set; }
        public double ProgressPercentage { get; set; }
        public bool IsCompleted { get; set; }
        public int TimeSpentMinutes { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    // Course Stats
    public class CourseStatsDTO
    {
        public int TotalEnrollments { get; set; }
        public int ActiveEnrollments { get; set; }
        public int CompletedEnrollments { get; set; }
        public decimal AverageProgress { get; set; }
        public decimal AverageGrade { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalSubmissions { get; set; }
        public Dictionary<string, int> RatingDistribution { get; set; }
        public Dictionary<string, int> DifficultyDistribution { get; set; }
        public List<TopStudentDTO> TopStudents { get; set; }
    }

    public class TopStudentDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int Rank { get; set; }
        public int TotalPoints { get; set; }
        public float ProgressPercentage { get; set; }
    }

    // Course Filter
    public class CourseFilterDTO
    {
        public string? Search { get; set; }
        public List<int>? UniversityIds { get; set; }
        public List<int>? DepartmentIds { get; set; }
        public List<string>? DifficultyLevels { get; set; }
        public bool? IsFree { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public List<string>? CourseTypes { get; set; }
        public List<string>? Statuses { get; set; }
        public string? SortBy { get; set; } // popularity, newest, rating, price_low, price_high
        public bool SortDescending { get; set; } = true;
        public int? TeacherId { get; set; }
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
    }

    // Top Course
    public class TopCourseDTO
    {
        public CourseDTO Course { get; set; }
        public int EnrollmentCount { get; set; }
        public decimal AverageRating { get; set; }
        public decimal CompletionRate { get; set; }
    }

    // FAQ
    public class FAQDTO
    {
        public int Id { get; set; }
        public string Question { get; set; }
        public string Answer { get; set; }
        public int Order { get; set; }
    }

    // Teacher DTO
    public class TeacherDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }
        public string? Qualifications { get; set; }
        public string? Experience { get; set; }
        public string? Specialization { get; set; }
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
        public decimal AverageRating { get; set; }
        public bool IsVerified { get; set; }
    }

    // Debug DTO for diagnosing teacher/course/student counts
    public class TeacherDebugDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int TotalCoursesReported { get; set; } // value returned on normal TeacherDTO
        public int TotalStudentsReported { get; set; } // value returned on normal TeacherDTO
        public int DerivedCourseCount { get; set; } // courses where Course.TeacherId == teacherId && Course.UniversityId == universityId
        public int DerivedDistinctStudentCount { get; set; } // distinct enrolled students across those courses
        public List<int> DerivedCourseIds { get; set; } = new List<int>();
    }
}