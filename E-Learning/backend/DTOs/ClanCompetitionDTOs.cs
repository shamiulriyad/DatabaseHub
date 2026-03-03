using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

// ===== REGULAR COMPETITION DTOs =====

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

public class CompetitionQuestionFeedbackDTO
{
    public int QuestionId { get; set; }
    public required string SubmittedAnswer { get; set; }
    public required string CorrectAnswer { get; set; }
    public bool IsCorrect { get; set; }
    public int PointsAwarded { get; set; }
}

// Extend competition result to include per-question feedback
public class CompetitionResultWithFeedbackDTO : CompetitionResultDTO
{
    public List<CompetitionQuestionFeedbackDTO>? QuestionResults { get; set; }
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

public class SubmitCompetitionAnswerDTO
{
    [Required]
    public int QuestionId { get; set; }

    [Required]
    public required string Answer { get; set; } // "A"|"B"|"C"|"D"
}

public class SubmitCompetitionAnswersDTO
{
    [Required]
    public required List<SubmitCompetitionAnswerDTO> Answers { get; set; }
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

// ===== CLAN VS CLAN COMPETITION DTOs =====

public class CreateClanVsClansCompetitionDTO
{
    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    public string? Description { get; set; }

    [Required]
    [MaxLength(20)]
    public required string CompetitionType { get; set; } // Programming, Quiz, Mixed

    [Required]
    [MaxLength(10)]
    public required string DifficultyLevel { get; set; } // Easy, Medium, Hard

    [Required]
    public int ParticipantsPerClan { get; set; } // e.g., 3, 5

    [Required]
    public int DurationMinutes { get; set; } // e.g., 20, 30, 60

    [Required]
    public int OpponentClanId { get; set; } // Clan being challenged

    public DateTime? ScheduledStartTime { get; set; } // Optional: when the competition should start
}

public class ClanVsClansCompetitionDetailDTO
{
    public int Id { get; set; }

    [Required]
    public required string Title { get; set; }

    public string? Description { get; set; }

    public required ClanBasicDTO ChallengerClan { get; set; }
    public required ClanBasicDTO OpponentClan { get; set; }

    public required string CompetitionType { get; set; }
    public required string DifficultyLevel { get; set; }
    public int ParticipantsPerClan { get; set; }
    public int DurationMinutes { get; set; }

    [Required]
    public required string Status { get; set; } // Pending, Scheduled, Ongoing, Completed, Rejected, Cancelled

    public DateTime CreatedAt { get; set; }
    public DateTime? ScheduledStartTime { get; set; }
    public DateTime? CompetitionStartTime { get; set; }
    public DateTime? CompetitionEndTime { get; set; }

    public required List<ClanVsClansCompetitionParticipantDTO> ChallengerParticipants { get; set; }
    public required List<ClanVsClansCompetitionParticipantDTO> OpponentParticipants { get; set; }

    public int? ChallengerTotalScore { get; set; }
    public int? OpponentTotalScore { get; set; }

    public string? WinnerClanStatus { get; set; } // ChallengerWon, OpponentWon, Draw
    public bool ChallengerReady { get; set; }
    public bool OpponentReady { get; set; }
    public string? OpponentResponse { get; set; } // Pending, Accepted, Rejected
}

public class ClanVsClansCompetitionQuestionDTO
{
    public int Id { get; set; }
    public required string QuestionText { get; set; }
    public required string OptionA { get; set; }
    public required string OptionB { get; set; }
    public required string OptionC { get; set; }
    public required string OptionD { get; set; }
    public int Points { get; set; }
    public int QuestionOrder { get; set; }
    public string? Topic { get; set; }
    public required string DifficultyLevel { get; set; }
}

public class ClanVsClansCompetitionParticipantDTO
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string UserName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public required string Status { get; set; } // Selected, Started, Completed, Disqualified
    public int Score { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int UnansweredQuestions { get; set; }
    public int? TimeTakenSeconds { get; set; }
    public DateTime SelectedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class SelectClanVsClansCompetitionParticipantsDTO
{
    [Required]
    public required List<int> SelectedUserIds { get; set; }
}

public class SubmitClanVsClansCompetitionAnswerDTO
{
    [Required]
    public int QuestionId { get; set; }

    [Required]
    [MaxLength(1)]
    public required string Answer { get; set; } // A, B, C, D
}

public class AcceptClanVsClansCompetitionDTO
{
    public string? Action { get; set; } // "accept" or "reject"

    public string? RejectionReason { get; set; }
}

public class ClanVsClansCompetitionResultDTO
{
    public int CompetitionId { get; set; }
    public required ClanBasicDTO ChallengerClan { get; set; }
    public required ClanBasicDTO OpponentClan { get; set; }

    public int ChallengerTotalScore { get; set; }
    public int OpponentTotalScore { get; set; }

    public required string WinnerClan { get; set; } // "Challenger", "Opponent", "Draw"

    public required List<ClanVsClansCompetitionParticipantResultDTO> ChallengerResults { get; set; }
    public required List<ClanVsClansCompetitionParticipantResultDTO> OpponentResults { get; set; }

    public DateTime CompletedAt { get; set; }
}

public class ClanVsClansCompetitionParticipantResultDTO
{
    public int UserId { get; set; }
    public required string UserName { get; set; }
    public int Score { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int UnansweredQuestions { get; set; }
    public int? TimeTakenSeconds { get; set; }
    public int Rank { get; set; } // Rank within clan
}

public class ClanBasicDTO
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Tag { get; set; }
    public string? LogoUrl { get; set; }
    public int MemberCount { get; set; }
}