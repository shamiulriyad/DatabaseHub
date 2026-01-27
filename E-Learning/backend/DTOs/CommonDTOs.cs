using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    // Service Result wrapper
    public class ServiceResult<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public T Data { get; set; } = default!;
        public List<string> Errors { get; set; } = new List<string>();
        
        public static ServiceResult<T> SuccessResult(T data, string message = "Success")
        {
            return new ServiceResult<T> { Success = true, Data = data, Message = message };
        }
        
        public static ServiceResult<T> FailureResult(string message, List<string>? errors = null)
        {
            return new ServiceResult<T> 
            { 
                Success = false, 
                Message = message, 
                Errors = errors ?? new List<string>() 
            };
        }
    }

    // Pagination Types
    public class PaginatedResponse<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }

    public class PaginationInfoDTO
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public int TotalCount { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }

    // Add all other missing DTOs here
    public class CourseResponseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public string ThumbnailUrl { get; set; } = string.Empty;
        public float AverageRating { get; set; }
        public int TotalEnrollments { get; set; }
    }

    public class EnrollmentProgressDTO
    {
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalModules { get; set; }
        public int CompletedModules { get; set; }
        public float ProgressPercentage { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? LastAccessed { get; set; }
        public DateTime? EstimatedCompletion { get; set; }
    }

    public class CourseProgressDTO
    {
        // Backwards-compatible progress summary
        public Dictionary<string, float> ModuleProgress { get; set; } = new Dictionary<string, float>();
        public float OverallProgress { get; set; }
        public List<DateTime> ActivityDates { get; set; } = new List<DateTime>();
        public decimal AverageScore { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EstimatedCompletion { get; set; }

        // Fields used by frontend: total/completed/percentage/lastWatched
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public float Percentage { get; set; }
        public DateTime? LastWatched { get; set; }
    }

    // Payment Related DTOs
    public class PlatformEarningsDTO
    {
        public decimal TotalEarnings { get; set; }
        public decimal ThisMonth { get; set; }
        public decimal LastMonth { get; set; }
        public decimal GrowthPercentage { get; set; }
        public List<DailyEarningDTO> DailyEarnings { get; set; } = new List<DailyEarningDTO>();
    }

    public class DailyEarningDTO
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    public class PlatformPaymentStatsDTO
    {
        public int TotalTransactions { get; set; }
        public int SuccessfulTransactions { get; set; }
        public int FailedTransactions { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageTransactionValue { get; set; }
    }

    public class SupportTicketDTO
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

    // Ranking Related DTOs
    public class DepartmentRankingDTO
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int TotalScore { get; set; }
        public int Rank { get; set; }
        public float AverageStudentScore { get; set; }
    }

    public class CourseRankingDTO
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public int TotalEnrollments { get; set; }
        public int TotalScore { get; set; }
        public int Rank { get; set; }
        public float AverageStudentScore { get; set; }
    }

    public class StreakDTO
    {
        public int UserId { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime LastActivity { get; set; }
    }

    public class LevelProgressDTO
    {
        public int CurrentLevel { get; set; }
        public int CurrentPoints { get; set; }
        public int PointsToNextLevel { get; set; }
        public float ProgressPercentage { get; set; }
        public int NextLevel { get; set; }
    }

    public class GlobalLeaderboardDTO
    {
        public string TimeFrame { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
        public int TotalParticipants { get; set; }
        public List<LeaderboardEntryDTO> Entries { get; set; } = new List<LeaderboardEntryDTO>();
    }

    public class CourseLeaderboardDTO
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public string TimeFrame { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
        public int TotalParticipants { get; set; }
        public List<LeaderboardEntryDTO> Entries { get; set; } = new List<LeaderboardEntryDTO>();
    }

    public class TeacherLeaderboardDTO
    {
        public string TimeFrame { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
        public int TotalTeachers { get; set; }
        public List<TeacherLeaderboardEntryDTO> Entries { get; set; } = new List<TeacherLeaderboardEntryDTO>();
    }

    public class TeacherLeaderboardEntryDTO
    {
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public string ProfileImage { get; set; } = string.Empty;
        public string UniversityName { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public int TotalCourses { get; set; }
        public int TotalEnrollments { get; set; }
        public float AverageRating { get; set; }
        public int Rank { get; set; }
    }

    public class RankingStatsDTO
    {
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public int CurrentLevel { get; set; }
        public int TotalPoints { get; set; }
        public int? UniversityRank { get; set; }
        public int? GlobalRank { get; set; }
        public float Percentile { get; set; }
        public int PointsToNextLevel { get; set; }
        public float ProgressToNextLevel { get; set; }
        public int? CourseId { get; set; }
        public string? CourseTitle { get; set; }
        public int? TotalEnrollments { get; set; }
        public float? AverageRating { get; set; }
        public float? CompletionRate { get; set; }
        public int? CourseRank { get; set; }
    }

    public class UniversityLeaderboardDTO
    {
        public string TimeFrame { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
        public int TotalUniversities { get; set; }
        public List<UniversityRankingDTO> Entries { get; set; } = new List<UniversityRankingDTO>();
    }

    public class RankingHistoryDTO
    {
        public DateTime Date { get; set; }
        public int Rank { get; set; }
        public int Score { get; set; }
    }

    public class SearchResultDTO
    {
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public List<dynamic> Results { get; set; } = new List<dynamic>();
    }
}

// Extension methods for ServiceResult with PaginatedResponse
public static class ServiceResultExtensions
{
    // For ServiceResult<PaginatedResponse<CourseDTO>>
    public static dynamic GetCourses(this ServiceResult<PaginatedResponse<CourseDTO>> result)
    {
        return result.Data?.Items;
    }

    // For ServiceResult<PaginatedResponse<EnrollmentDTO>>
    public static dynamic GetEnrollments(this ServiceResult<PaginatedResponse<EnrollmentDTO>> result)
    {
        return result.Data?.Items;
    }

    // For ServiceResult<PaginatedResponse<ReviewDTO>>
    public static dynamic GetReviews(this ServiceResult<PaginatedResponse<ReviewDTO>> result)
    {
        return result.Data?.Items;
    }

    // For ServiceResult<PaginatedResponse<ModuleDTO>>
    public static dynamic GetModules(this ServiceResult<List<ModuleDTO>> result)
    {
        return result.Data;
    }

    // For ServiceResult<SearchResultDTO>
    public static dynamic GetResults(this ServiceResult<SearchResultDTO> result)
    {
        return result.Data?.Results;
    }

    // For ServiceResult<CourseStatsDTO>
    public static dynamic GetStats(this ServiceResult<CourseStatsDTO> result)
    {
        return result.Data;
    }
}