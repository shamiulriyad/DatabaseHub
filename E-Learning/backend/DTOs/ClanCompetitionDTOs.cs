using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

// Competition DTOs
public class CompetitionDetailDTO : CompetitionDTO
{
    public required List<CompetitionParticipantDTO> Participants { get; set; }
    public int TotalParticipants { get; set; }
    public required new string Status { get; set; }
}

public class CreateCompetitionDTO
{
    [Required]
    public required string Title { get; set; }

    public string? Description { get; set; }

    public string? CompetitionType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? ClanId { get; set; }
    public bool IsPublic { get; set; } = true;
    public List<int>? AllowedMemberIds { get; set; }
    public List<int>? AllowedClanIds { get; set; }
    public int? PointRangeMin { get; set; }
    public int? PointRangeMax { get; set; }
    
    [Required]
    public List<CreateCompetitionQuestionDTO> Questions { get; set; } = new List<CreateCompetitionQuestionDTO>();
}

public class UpdateCompetitionDTO
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsPublic { get; set; }
    public List<int>? AllowedMemberIds { get; set; }
    public List<int>? AllowedClanIds { get; set; }
    public int? PointRangeMin { get; set; }
    public int? PointRangeMax { get; set; }
}

public class CompetitionParticipantDTO
{
    public int ParticipantId { get; set; }
    public required string ParticipantName { get; set; }
    public required string ParticipantType { get; set; } // Individual, Team
    public int Score { get; set; }
    public int Rank { get; set; }
    public required string Status { get; set; }
}

public class CompetitionResultDTO
{
    public int CompetitionId { get; set; }
    public int ParticipantId { get; set; }
    public int FinalScore { get; set; }
    public int FinalRank { get; set; }
    public required string Result { get; set; } // Winner, Qualified, Participated
    public DateTime? SubmittedAt { get; set; }
}

public class CompetitionLeaderboardDTO
{
    public required List<CompetitionParticipantDTO> Participants { get; set; }
    public DateTime LastUpdatedAt { get; set; }
}

public class SubmitCompetitionDTO
{
    [Required]
    public required string Submission { get; set; }

    public List<IFormFile>? Attachments { get; set; }
}

public class CompetitionStatsDTO
{
    public int TotalParticipants { get; set; }
    public int ActiveParticipants { get; set; }
    public decimal AverageScore { get; set; }
    public int HighestScore { get; set; }
}

public class UserCompetitionStatsDTO
{
    public int CompetitionsJoined { get; set; }
    public int CompetitionsWon { get; set; }
    public decimal WinRate { get; set; }
    public int TotalPrizeWinnings { get; set; }
}

public class CreateTeamDTO
{
    [Required]
    public required string TeamName { get; set; }

    public List<int>? MemberIds { get; set; }
}

public class TeamDTO
{
    public int Id { get; set; }
    public int CompetitionId { get; set; }
    public required string TeamName { get; set; }
    public int LeaderId { get; set; }
    public required List<UserDTO> Members { get; set; }
    public int TotalScore { get; set; }
}

public class ApprovalActionDTO
{
    [Required]
    public required string Action { get; set; } // "approve" or "reject"

    public string? RejectionReason { get; set; } // Optional reason if rejecting
}

public class PendingCompetitionDTO
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string CompetitionType { get; set; }
    public int CreatorId { get; set; }
    public required string CreatorRole { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? ClanId { get; set; }
}

public class CreateCompetitionQuestionDTO
{
    [Required]
    public string QuestionText { get; set; } = null!;

    [Required]
    public string OptionA { get; set; } = null!;

    [Required]
    public string OptionB { get; set; } = null!;

    [Required]
    public string OptionC { get; set; } = null!;

    [Required]
    public string OptionD { get; set; } = null!;

    [Required]
    [MaxLength(1)]
    public string CorrectAnswer { get; set; } = null!; // "A", "B", "C", or "D"

    public int Points { get; set; } = 1;

    public int Order { get; set; } = 1;
}

public class CompetitionQuestionDTO
{
    public int Id { get; set; }
    public int CompetitionId { get; set; }
    public string QuestionText { get; set; } = null!;
    public string OptionA { get; set; } = null!;
    public string OptionB { get; set; } = null!;
    public string OptionC { get; set; } = null!;
    public string OptionD { get; set; } = null!;
    public string CorrectAnswer { get; set; } = null!;
    public int Points { get; set; }
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; }
}