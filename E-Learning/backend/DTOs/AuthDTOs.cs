// DTOs/AuthDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Registration
    public class RegisterDTO
    {
        [Required]
        [MinLength(3)]
        [MaxLength(50)]
        public string Username { get; set; } = null!;

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = null!;

        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? CoverImageUrl { get; set; }
    }

    // Login
    public class LoginDTO
    {
        [Required]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        public bool RememberMe { get; set; } = false;
    }

    // Profile Update
    public class UpdateProfileDTO
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(50)]
        public string? Username { get; set; }

        [MaxLength(500)]
        public string? Bio { get; set; }

        [Phone]
        public string? PhoneNumber { get; set; }

        public string? ProfileImageUrl { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        
        // Social Links
        public string? FacebookUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? GitHubUrl { get; set; }

        public int? StreakDays { get; set; }
        public DateTime? LastActive { get; set; }
    }

    // Password Change
    public class ChangePasswordDTO
    {
        [Required]
        public string OldPassword { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = null!;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = null!;
    }

    // Forgot Password
    public class ForgotPasswordDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
    }

    // Reset Password
    public class ResetPasswordDTO
    {
        [Required]
        public string Token { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = null!;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = null!;
    }

    // User Clan Info
    public class UserClanDTO
    {
        public int ClanId { get; set; }
        public string ClanName { get; set; } = null!;
        public string ClanTag { get; set; } = null!;
        public string? ClanLogoUrl { get; set; }
        public string Role { get; set; } = "Member"; // Leader, CoLeader, Elder, Member
        public int ContributionPoints { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    // User Response
    public class UserDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string FullName => $"{FirstName} {LastName}";
        public string? ProfileImageUrl { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Bio { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool IsStudent { get; set; }
        public bool IsTeacher { get; set; }
        public bool IsCompetitor { get; set; }
        public bool IsAdmin { get; set; }
        public long Exp { get; set; }
        public int Level { get; set; }
        public int TotalPoints { get; set; }
        public int CurrentRank { get; set; }
        public int StreakDays { get; set; }
        public int TotalCoursesEnrolled { get; set; }
        public int TotalCoursesCompleted { get; set; }
        public decimal AverageGrade { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public DateTime? LastActive { get; set; }
        // Date when the user applied to become a teacher (if any)
        public DateTime? TeacherRequestDate { get; set; }
        
        // Clan Info
        public UserClanDTO? CurrentClan { get; set; }
    }

    // Auth Response
    public class AuthResponseDTO
    {
        public string Token { get; set; } = null!;
        public UserDTO User { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }

    // Dashboard
    public class DashboardDTO
    {
        public UserDTO User { get; set; } = null!;
        public List<EnrollmentDTO> RecentEnrollments { get; set; } = null!;
        public List<CourseDTO> RecommendedCourses { get; set; } = null!;
        public List<CompetitionDTO> UpcomingCompetitions { get; set; } = null!;
        public List<ClanDTO> MyClans { get; set; } = null!;
        public DashboardStatsDTO Stats { get; set; } = null!;
    }

    public class DashboardStatsDTO
    {
        public int TotalEnrollments { get; set; }
        public int CompletedCourses { get; set; }
        public int OngoingCourses { get; set; }
        public decimal AverageScore { get; set; }
        public int CurrentStreak { get; set; }
        public int TotalPoints { get; set; }
        public int Rank { get; set; }
        public int TotalCompetitions { get; set; }
        public int CompetitionWins { get; set; }
    }

    // User profile
    public class UserProfileDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Bio { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public long Exp { get; set; }
        public int Level { get; set; }
        public int TotalPoints { get; set; }
        public int CurrentRank { get; set; }
        public List<UserRoleDTO> Roles { get; set; } = new();
    }

    public class UserRoleDTO
    {
        public string RoleName { get; set; } = null!;
        public string? Description { get; set; }
    }

    // Teacher Approval DTOs
    public class RejectTeacherRequestDTO
    {
        public string? Reason { get; set; }
    }
}