// DTOs/AdminDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Platform Stats
    public class PlatformStatsDTO
    {
        public int TotalUsers { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalCourses { get; set; }
        public int PendingTeachers { get; set; }
        public int ActiveCourses { get; set; }
        public decimal TotalRevenue { get; set; }
        public int ActiveUsers { get; set; }
        public int NewUsersThisMonth { get; set; }
        public double CourseCompletionRate { get; set; }
        
        // Legacy fields (optional)
        public int TotalUniversities { get; set; }
        public int TotalDepartments { get; set; }
        public int TotalEnrollments { get; set; }
        public int TotalPosts { get; set; }
        public int TotalComments { get; set; }
        public int TotalClans { get; set; }
        public int TotalCompetitions { get; set; }
        public int ActiveUsersToday { get; set; }
        public int NewUsersToday { get; set; }
        public int NewCoursesToday { get; set; }
        public int PendingCourses { get; set; }
        public int PendingWithdrawals { get; set; }
        public decimal TodayRevenue { get; set; }
        public decimal PlatformBalance { get; set; }
    }

    // User Management
    public class UserFilterDTO
    {
        public string? Search { get; set; }
        public string? Role { get; set; } // Student, Teacher, Admin, All
        public bool? IsActive { get; set; }
        public bool? IsVerified { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public int? UniversityId { get; set; }
        public int? DepartmentId { get; set; }
        public string? SortBy { get; set; } // newest, oldest, points, enrollments
        public bool SortDescending { get; set; } = true;
    }

    public class UpdateUserStatusDTO
    {
        [Required]
        public bool IsActive { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }
    }

    public class UpdateUserRoleDTO
    {
        [Required]
        public bool IsStudent { get; set; }

        [Required]
        public bool IsTeacher { get; set; }

        [Required]
        public bool IsAdmin { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }
    }

    // Course Approval
    public class CourseApprovalFilterDTO
    {
        public string? Status { get; set; } // Pending, Approved, Rejected
        public int? UniversityId { get; set; }
        public int? DepartmentId { get; set; }
        public int? TeacherId { get; set; }
        public DateTime? SubmittedFrom { get; set; }
        public DateTime? SubmittedTo { get; set; }
        public string? SortBy { get; set; } // newest, oldest
    }

    public class ApproveCourseDTO
    {
        [MaxLength(500)]
        public string? Notes { get; set; }

        public bool NotifyTeacher { get; set; } = true;
    }

    public class RejectCourseDTO
    {
        [Required]
        [MaxLength(500)]
        public string Reason { get; set; }

        public bool NotifyTeacher { get; set; } = true;
        public bool AllowResubmission { get; set; } = true;
        public DateTime? ResubmissionDeadline { get; set; }
    }

    // Content Moderation
    public class ContentReportDTO
    {
        public int Id { get; set; }
        public string ContentType { get; set; } // Post, Comment, Review, User
        public int ContentId { get; set; }
        public string ContentPreview { get; set; }
        public int ReporterId { get; set; }
        public string ReporterName { get; set; }
        public string Reason { get; set; }
        public string? Description { get; set; }
        public int ReportCount { get; set; }
        public string Status { get; set; } // Pending, Reviewed, Resolved
        public DateTime ReportedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public int? ResolvedBy { get; set; }
        public string? ResolutionNotes { get; set; }
    }

    public class HandleReportDTO
    {
        [Required]
        [MaxLength(20)]
        public string Action { get; set; } // Dismiss, RemoveContent, WarnUser, SuspendUser, BanUser

        [MaxLength(500)]
        public string? Notes { get; set; }

        public int? DurationDays { get; set; } // For suspensions
        public bool NotifyUser { get; set; } = true;
    }

    // System Logs
    public class SystemLogDTO
    {
        public int Id { get; set; }
        public string Level { get; set; } // Info, Warning, Error, Critical
        public string Module { get; set; }
        public string Action { get; set; }
        public string Message { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class LogFilterDTO
    {
        public string? Level { get; set; }
        public string? Module { get; set; }
        public int? UserId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Search { get; set; }
    }

    // Analytics
    public class AnalyticsFilterDTO
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Timeframe { get; set; } // daily, weekly, monthly, yearly
        public int? UniversityId { get; set; }
        public int? DepartmentId { get; set; }
        public int? CourseId { get; set; }
    }

    public class UserAnalyticsDTO
    {
        public List<UserGrowthDTO> UserGrowth { get; set; }
        public List<UserActivityDTO> UserActivity { get; set; }
        public Dictionary<string, int> UserRoleDistribution { get; set; }
        public List<TopActiveUserDTO> TopActiveUsers { get; set; }
        public UserRetentionDTO Retention { get; set; }
    }

    public class UserGrowthDTO
    {
        public string Period { get; set; }
        public int NewUsers { get; set; }
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
    }

    public class UserActivityDTO
    {
        public string Period { get; set; }
        public int Logins { get; set; }
        public int Enrollments { get; set; }
        public int CourseCompletions { get; set; }
        public int ForumPosts { get; set; }
        public int QuizAttempts { get; set; }
    }

    public class TopActiveUserDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int LoginCount { get; set; }
        public int TimeSpent { get; set; }
        public int Activities { get; set; }
        public int PointsEarned { get; set; }
    }

    public class UserRetentionDTO
    {
        public decimal Day1Retention { get; set; }
        public decimal Day7Retention { get; set; }
        public decimal Day30Retention { get; set; }
        public List<CohortRetentionDTO> CohortAnalysis { get; set; }
    }

    public class CohortRetentionDTO
    {
        public string Cohort { get; set; }
        public int TotalUsers { get; set; }
        public Dictionary<int, decimal> RetentionRates { get; set; } // Day -> Retention Rate
    }

    public class CourseAnalyticsDTO
    {
        public List<CoursePerformanceDTO> CoursePerformance { get; set; }
        public List<EnrollmentTrendDTO> EnrollmentTrends { get; set; }
        public List<RevenueDTO> Revenue { get; set; }
        public List<TopCourseDTO> TopCourses { get; set; }
        public List<CourseCompletionDTO> CourseCompletions { get; set; }
    }

    public class CoursePerformanceDTO
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int Enrollments { get; set; }
        public int Completions { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal AverageRating { get; set; }
        public decimal AverageGrade { get; set; }
        public decimal Revenue { get; set; }
    }

    public class EnrollmentTrendDTO
    {
        public string Period { get; set; }
        public int NewEnrollments { get; set; }
        public int TotalEnrollments { get; set; }
        public int ActiveEnrollments { get; set; }
    }

    public class RevenueDTO
    {
        public string Period { get; set; }
        public decimal Revenue { get; set; }
        public decimal PlatformEarnings { get; set; }
        public decimal TeacherEarnings { get; set; }
        public int Transactions { get; set; }
    }

    public class CourseCompletionDTO
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int Started { get; set; }
        public int Completed { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal AverageTimeToComplete { get; set; }
    }

    // Recent activity item for admin dashboard
    public class RecentActivityDTO
    {
        public string Action { get; set; } = null!; // e.g., "New user registered"
        public string User { get; set; } = null!; // display name
        public DateTime Time { get; set; }
        public string? Meta { get; set; } // optional extra info (course title, amount)
    }

    // System Settings
    public class SystemSettingsDTO
    {
        // General
        public string SiteName { get; set; }
        public string SiteDescription { get; set; }
        public string ContactEmail { get; set; }
        public string SupportEmail { get; set; }
        public string DefaultLanguage { get; set; }
        public string Timezone { get; set; }
        
        // Course Settings
        public bool CourseApprovalRequired { get; set; }
        public decimal PlatformCommission { get; set; }
        public int MaxCourseDuration { get; set; }
        public int MinCourseDuration { get; set; }
        public decimal MaxCoursePrice { get; set; }
        public decimal MinCoursePrice { get; set; }
        
        // User Settings
        public bool EmailVerificationRequired { get; set; }
        public bool TeacherVerificationRequired { get; set; }
        public int MaxProfileImageSize { get; set; }
        public List<string> AllowedFileTypes { get; set; }
        
        // Payment Settings
        public string Currency { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal MinimumWithdrawalAmount { get; set; }
        public int WithdrawalProcessingDays { get; set; }
        
        // Email Settings
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUsername { get; set; }
        public string SmtpPassword { get; set; }
        public bool SmtpUseSsl { get; set; }
        
        // Security
        public bool RequireStrongPassword { get; set; }
        public int MaxLoginAttempts { get; set; }
        public int SessionTimeout { get; set; }
        public bool EnableTwoFactorAuth { get; set; }
        
        // SEO
        public string MetaKeywords { get; set; }
        public string MetaDescription { get; set; }
        public string GoogleAnalyticsId { get; set; }
        
        // Social Media
        public string FacebookUrl { get; set; }
        public string TwitterUrl { get; set; }
        public string LinkedInUrl { get; set; }
        public string InstagramUrl { get; set; }
        public string YouTubeUrl { get; set; }
    }

    public class UpdateSystemSettingsDTO
    {
        public string? SiteName { get; set; }
        public string? SiteDescription { get; set; }
        public string? ContactEmail { get; set; }
        public string? SupportEmail { get; set; }
        public string? DefaultLanguage { get; set; }
        public string? Timezone { get; set; }
        public bool? CourseApprovalRequired { get; set; }
        public decimal? PlatformCommission { get; set; }
        public int? MaxCourseDuration { get; set; }
        public int? MinCourseDuration { get; set; }
        public decimal? MaxCoursePrice { get; set; }
        public decimal? MinCoursePrice { get; set; }
        public bool? EmailVerificationRequired { get; set; }
        public bool? TeacherVerificationRequired { get; set; }
        public int? MaxProfileImageSize { get; set; }
        public List<string>? AllowedFileTypes { get; set; }
        public string? Currency { get; set; }
        public decimal? TaxPercentage { get; set; }
        public decimal? MinimumWithdrawalAmount { get; set; }
        public int? WithdrawalProcessingDays { get; set; }
        public string? SmtpServer { get; set; }
        public int? SmtpPort { get; set; }
        public string? SmtpUsername { get; set; }
        public string? SmtpPassword { get; set; }
        public bool? SmtpUseSsl { get; set; }
        public bool? RequireStrongPassword { get; set; }
        public int? MaxLoginAttempts { get; set; }
        public int? SessionTimeout { get; set; }
        public bool? EnableTwoFactorAuth { get; set; }
        public string? MetaKeywords { get; set; }
        public string? MetaDescription { get; set; }
        public string? GoogleAnalyticsId { get; set; }
        public string? FacebookUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? YouTubeUrl { get; set; }
    }

    // Backup & Export
    public class BackupDTO
    {
        public string BackupId { get; set; }
        public DateTime CreatedAt { get; set; }
        public long Size { get; set; }
        public string Type { get; set; } // Full, Partial
        public string Status { get; set; } // Creating, Completed, Failed
        public string? DownloadUrl { get; set; }
    }

    public class CreateBackupDTO
    {
        public string Type { get; set; } = "Full";
        public bool IncludeMedia { get; set; } = false;
        public string? Description { get; set; }
    }

    public class ExportDataDTO
    {
        public string Format { get; set; } = "CSV";
        public List<string> Entities { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? UniversityId { get; set; }
        public int? DepartmentId { get; set; }
    }

    public class EmailDTO
    {
        [Required]
        [EmailAddress]
        public string To { get; set; }

        [Required]
        public string Subject { get; set; }

        [Required]
        public string Body { get; set; }

        public string? HtmlBody { get; set; }
        public List<string>? AttachmentUrls { get; set; }
    }

    public class CreateNotificationDTO
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Message { get; set; }

        public string? Type { get; set; } // Info, Warning, Error, Success
        public int? UserId { get; set; }
        public string? Role { get; set; } // Send to all users with this role
        public bool SendToAll { get; set; } = false;
        public bool SendEmail { get; set; } = false;
        public string? ActionUrl { get; set; }
    }

    public class DashboardCardDTO
    {
        public string Title { get; set; }
        public string Value { get; set; }
        public string? Subtitle { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public string? Trend { get; set; } // Up, Down, Neutral
        public float? TrendValue { get; set; }
        public string? ActionUrl { get; set; }
    }

    public class SiteConfigDTO
    {
        public string SiteName { get; set; }
        public string SiteDescription { get; set; }
        public string SiteLogo { get; set; }
        public string SiteFavicon { get; set; }
        public string ContactEmail { get; set; }
        public string SupportPhoneNumber { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public bool MaintenanceMode { get; set; }
        public string? MaintenanceMessage { get; set; }
        public Dictionary<string, string>? SocialMedia { get; set; }
        public decimal? PlatformCommissionPercentage { get; set; }
        public bool EnableUserRegistration { get; set; }
        public bool RequireEmailVerification { get; set; }
        public int PasswordMinLength { get; set; }
        public int SessionTimeoutMinutes { get; set; }
        public string? PrivacyPolicyUrl { get; set; }
        public string? TermsOfServiceUrl { get; set; }
    }

    public class ExportResultDTO
    {
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string Format { get; set; }
        public long FileSize { get; set; }
        public DateTime CreatedAt { get; set; }
        public int RecordCount { get; set; }
    }
}