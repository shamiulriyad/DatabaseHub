using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Base competition representation used across services
    public class CompetitionDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? CompetitionType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "upcoming"; // upcoming, ongoing, completed, pendinnapproval
        public int MaxParticipants { get; set; }
        public bool IsTeamBased { get; set; }
        public int TeamSize { get; set; }
        public int? ClanId { get; set; }
        public int? CourseId { get; set; }
        public int CreatorId { get; set; }
        public string CreatorRole { get; set; } // Student, Teacher, Admin, ClanLeader
        public bool IsApproved { get; set; }
        public bool IsPublic { get; set; } = true;
        public List<int>? AllowedMemberIds { get; set; }
        public List<int>? AllowedClanIds { get; set; }
        public int? PointRangeMin { get; set; }
        public int? PointRangeMax { get; set; }
        public int ParticipantCount { get; set; }
        public int PrizePool { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<CompetitionQuestionDTO> Questions { get; set; } = new List<CompetitionQuestionDTO>();
    }

    // Lightweight DTO for listing competitions in dashboards
    public class CompetitionSummaryDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ParticipantCount { get; set; }
        public bool IsRegistered { get; set; }
    }
}
