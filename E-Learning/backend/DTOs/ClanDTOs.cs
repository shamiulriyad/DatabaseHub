// DTOs/ClanDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Clan Create
    public class CreateClanDTO
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [MaxLength(10)]
        public string Tag { get; set; }

        [Required]
        public string Description { get; set; }

        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Motto { get; set; }

        [Required]
        [MaxLength(20)]
        public string ClanType { get; set; } = "Academic";

        public int? UniversityId { get; set; }
        public int? DepartmentId { get; set; }
        public int? CourseId { get; set; }
        public List<string>? FocusSubjects { get; set; }

        public bool IsPublic { get; set; } = true;
        public bool RequireApproval { get; set; } = false;
        public int MaxMembers { get; set; } = 100;
        public string? JoinCriteria { get; set; }
    }

    // Clan Update
    public class UpdateClanDTO
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Motto { get; set; }
        public string? ClanType { get; set; }
        public List<string>? FocusSubjects { get; set; }
        public bool? IsPublic { get; set; }
        public bool? RequireApproval { get; set; }
        public int? MaxMembers { get; set; }
        public string? JoinCriteria { get; set; }
    }

    // Clan Response
    public class ClanDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Tag { get; set; }
        public string Description { get; set; }
        public int LeaderId { get; set; }
        public string LeaderName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Motto { get; set; }
        public string ClanType { get; set; }
        public int? UniversityId { get; set; }
        public string? UniversityName { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int? CourseId { get; set; }
        public string? CourseTitle { get; set; }
        public List<string> FocusSubjects { get; set; }
        public bool IsPublic { get; set; }
        public bool RequireApproval { get; set; }
        public int MaxMembers { get; set; }
        public int MemberCount { get; set; }
        public int TotalPoints { get; set; }
        public int WeeklyPoints { get; set; }
        public int MonthlyPoints { get; set; }
        public int Rank { get; set; }
        public int TotalCompetitions { get; set; }
        public int CompetitionWins { get; set; }
        public int TotalPosts { get; set; }
        public bool IsMember { get; set; }
        public string? MemberRole { get; set; }
        public bool HasPendingJoinRequest { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastActivity { get; set; }
    }

    // Clan Detail
    public class ClanDetailDTO : ClanDTO
    {
        public UserDTO Leader { get; set; }
        public List<ClanMemberDTO> Members { get; set; }
        public List<PostDTO> RecentPosts { get; set; }
        public List<CompetitionDTO> RecentCompetitions { get; set; }
        public ClanStatsDTO Stats { get; set; }
        public List<ClanActivityDTO> RecentActivities { get; set; }
    }

    // Clan Member
    public class ClanMemberDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string Role { get; set; }
        public int ContributionPoints { get; set; }
        public int WeeklyPoints { get; set; }
        public int MonthlyPoints { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime? LastActive { get; set; }
        public int TotalPosts { get; set; }
        public int TotalComments { get; set; }
        public bool IsCurrentUser { get; set; }
    }

    // Update Member Role
    public class UpdateMemberRoleDTO
    {
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } // Leader, CoLeader, Elder, Member
    }

    // Clan Activity
    public class ClanActivityDTO
    {
        public int Id { get; set; }
        public string ActivityType { get; set; } // MemberJoined, PostCreated, CompetitionWon, PointsEarned
        public string Description { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public int? PostId { get; set; }
        public string? PostTitle { get; set; }
        public int? CompetitionId { get; set; }
        public string? CompetitionTitle { get; set; }
        public int PointsEarned { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Clan Stats
    public class ClanStatsDTO
    {
        public int MemberCount { get; set; }
        public int ActiveMembers { get; set; }
        public int TotalPoints { get; set; }
        public int WeeklyPoints { get; set; }
        public int MonthlyPoints { get; set; }
        public int Rank { get; set; }
        public int TotalPosts { get; set; }
        public int TotalComments { get; set; }
        public int TotalCompetitions { get; set; }
        public int CompetitionWins { get; set; }
        public decimal WinRate { get; set; }
        public Dictionary<string, int> MemberRoleDistribution { get; set; }
        public List<TopMemberDTO> TopMembers { get; set; }
        public ClanPerformanceDTO Performance { get; set; }
    }

    public class TopMemberDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? ProfileImage { get; set; }
        public int ContributionPoints { get; set; }
        public int WeeklyPoints { get; set; }
        public int MonthlyPoints { get; set; }
        public string Role { get; set; }
    }

    public class ClanPerformanceDTO
    {
        public List<WeeklyPointsDTO> WeeklyPointsHistory { get; set; }
        public List<MonthlyPointsDTO> MonthlyPointsHistory { get; set; }
        public int RankingHistory { get; set; }
    }

    public class InvitationDTO
    {
        public int Id { get; set; }
        public int ClanId { get; set; }
        public int InvitedUserId { get; set; }
        public int InvitedByUserId { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class WeeklyPointsDTO
    {
        public string Week { get; set; }
        public int Points { get; set; }
        public int Rank { get; set; }
    }

    public class MonthlyPointsDTO
    {
        public string Month { get; set; }
        public int Points { get; set; }
        public int Rank { get; set; }
    }

    // Clan Leaderboard
    public class ClanLeaderboardDTO
    {
        public int Rank { get; set; }
        public ClanDTO Clan { get; set; }
        public int TotalPoints { get; set; }
        public int WeeklyPoints { get; set; }
        public int MonthlyPoints { get; set; }
        public int MemberCount { get; set; }
        public int CompetitionWins { get; set; }
        public decimal AverageMemberPoints { get; set; }
    }

    // Clan Search Filters
    public class ClanSearchFilterDTO
    {
        public string? Query { get; set; } // Search by name, description, tag
        public string? ClanType { get; set; } // Academic, Competitive, Social, StudyGroup
        public int? UniversityId { get; set; } // Filter by university
        public int? DepartmentId { get; set; } // Filter by department
        public int? MinRanking { get; set; } // Minimum rank
        public int? MaxRanking { get; set; } // Maximum rank
        public int? MinMemberCount { get; set; } // Minimum members
        public int? MaxMemberCount { get; set; } // Maximum members
        public bool? IsPublic { get; set; } // Public/Private clans
        public string? SortBy { get; set; } // rank, members, points, recent
        public string? SortOrder { get; set; } // asc, desc
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    // Clan Join Request/Response
    public class JoinRequestDTO
    {
        public int ClanId { get; set; }
        public string? Message { get; set; } // Optional message for join request
    }

    public class JoinResponseDTO
    {
        public int Id { get; set; }
        public int ClanId { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; } // Pending, Approved, Rejected
        public DateTime RequestedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedByUserId { get; set; }
    }
}
