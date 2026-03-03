using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateClanCompetitionDTO
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Required]
        [RegularExpression("Weekly|Monthly|Seasonal")]
        public string CompetitionPeriod { get; set; } = "Weekly";

        [Required]
        [RegularExpression("ProgrammingMCQ|DebuggingFix|Quiz|Mixed")]
        public string CompetitionType { get; set; } = "ProgrammingMCQ";

        public int? SeasonId { get; set; }

        [Required]
        public DateTime StartAt { get; set; }

        [Required]
        public DateTime EndAt { get; set; }

        [Range(3, 4)]
        public int TeamMinSize { get; set; } = 3;

        [Range(3, 4)]
        public int TeamMaxSize { get; set; } = 4;

        [Range(1, 10)]
        public int TopTeamsCountForClanScore { get; set; } = 2;

        [Range(1, 10)]
        public int MaxTeamsPerClan { get; set; } = 2;

        public List<CompetitionChallengeTypeWeightDTO> ChallengeTypes { get; set; } = new();
    }

    public class CompetitionChallengeTypeWeightDTO
    {
        [Required]
        [RegularExpression("ProblemSolving|Quiz|SpeedCoding|Debugging|Logical|AI")]
        public string ChallengeType { get; set; } = "ProblemSolving";

        [Range(0.0, 1.0)]
        public decimal Weight { get; set; }
    }

    public class GenerateTeamSuggestionsDTO
    {
        [Range(1, 500)]
        public int TotalTeamsAllowed { get; set; } = 20;

        [Range(1, 10)]
        public int TopTierMaxTeams { get; set; } = 5;

        [Range(1, 10)]
        public int MidTierMaxTeams { get; set; } = 3;

        [Range(1, 10)]
        public int LowTierMaxTeams { get; set; } = 1;

        [Range(0.0, 2.0)]
        public decimal HistoricalPerformanceWeight { get; set; } = 0.20m;

        [Range(0.0, 2.0)]
        public decimal ActiveMemberWeight { get; set; } = 0.10m;
    }

    public class ClanTeamSuggestionDTO
    {
        public int ClanId { get; set; }
        public string ClanName { get; set; } = string.Empty;
        public int ClanRank { get; set; }
        public int ClanPoints { get; set; }
        public int ActiveMembers { get; set; }
        public decimal HistoricalPerformanceScore { get; set; }
        public int SuggestedTeamCount { get; set; }
        public bool IsManualOverride { get; set; }
        public string SuggestionReason { get; set; } = string.Empty;
    }

    public class TeamSuggestionSummaryDTO
    {
        public int CompetitionId { get; set; }
        public int TotalTeamsAllowed { get; set; }
        public int TotalTeamsDistributed { get; set; }
        public int RemainingTeams { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<ClanTeamSuggestionDTO> Suggestions { get; set; } = new();
    }

    public class ManualTeamOverrideDTO
    {
        [Required]
        public int ClanId { get; set; }

        [Range(0, 100)]
        public int AssignedTeamCount { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }
    }

    public class ApplyTeamSuggestionOverrideDTO
    {
        [Range(1, 500)]
        public int TotalTeamsAllowed { get; set; } = 20;

        public List<ManualTeamOverrideDTO> Overrides { get; set; } = new();
    }

    public class CompetitionTeamOverviewEntryDTO
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public int ClanId { get; set; }
        public string ClanName { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public string Status { get; set; } = "Created";
        public bool IsRegistered { get; set; }
    }

    public class ClanMemberActivityEntryDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int ClanId { get; set; }
        public string ClanName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? LastActive { get; set; }
        public int TeamsJoined { get; set; }
        public decimal TotalCompetitionScore { get; set; }
    }

    public class ChallengeOverviewEntryDTO
    {
        public string ChallengeType { get; set; } = string.Empty;
        public decimal Weight { get; set; }
        public int Submissions { get; set; }
        public decimal AverageScore { get; set; }
    }

    public class CompetitionDashboardDTO
    {
        public int CompetitionId { get; set; }
        public string CompetitionTitle { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int TotalTeams { get; set; }
        public int PendingTeams { get; set; }
        public int ActiveTeams { get; set; }
        public int CompletedTeams { get; set; }
        public int RegisteredTeams { get; set; }
        public List<ChallengeOverviewEntryDTO> ChallengeOverview { get; set; } = new();
    }

    public class RegisterTeamToCompetitionDTO
    {
        [Required]
        public int TeamId { get; set; }
    }

    public class SubmitCompetitionChallengeDTO
    {
        [Required]
        public int TeamId { get; set; }

        [Required]
        public int ChallengeId { get; set; }

        [Required]
        public string PayloadJson { get; set; } = "{}";
    }

    public class CompetitionLeaderboardEntryDTO
    {
        public int RankNo { get; set; }
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public int ClanId { get; set; }
        public string ClanName { get; set; } = string.Empty;
        public decimal TotalScore { get; set; }
        public int PenaltySeconds { get; set; }
    }

    public class ClanLeaderboardEntryDTO
    {
        public int RankNo { get; set; }
        public int ClanId { get; set; }
        public string ClanName { get; set; } = string.Empty;
        public decimal TotalScore { get; set; }
        public int TeamCount { get; set; }
    }

    public class ClanCompetitionFinalizeResultDTO
    {
        public int CompetitionId { get; set; }
        public string CompetitionTitle { get; set; } = string.Empty;
        public string FinalStatus { get; set; } = "Finalized";
        public List<CompetitionLeaderboardEntryDTO> TeamLeaderboard { get; set; } = new();
        public List<ClanLeaderboardEntryDTO> ClanLeaderboard { get; set; } = new();
        public List<CompetitionExpDistributionDTO> ExpDistribution { get; set; } = new();
        public DateTime FinalizedAt { get; set; }
    }

    public class CompetitionExpDistributionDTO
    {
        public string RankRange { get; set; } = string.Empty;
        public int Exp { get; set; }
    }

    public class ClanTypePerformanceEntryDTO
    {
        public int ClanId { get; set; }
        public string ClanName { get; set; } = string.Empty;
        public int CompetitionsPlayed { get; set; }
        public decimal AverageClanRank { get; set; }
        public int BestClanRank { get; set; }
        public decimal TotalScore { get; set; }
        public decimal AverageScore { get; set; }
    }

    public class SeasonalClanRankingEntryDTO
    {
        public int RankNo { get; set; }
        public int ClanId { get; set; }
        public string ClanName { get; set; } = string.Empty;
        public decimal SeasonPoints { get; set; }
        public int CompetitionsPlayed { get; set; }
    }

    // ===== MCQ Question Management DTOs =====

    public class CreateMCQQuestionDTO
    {
        [Required]
        public string QuestionText { get; set; } = string.Empty;

        [Required]
        public string OptionA { get; set; } = string.Empty;

        [Required]
        public string OptionB { get; set; } = string.Empty;

        [Required]
        public string OptionC { get; set; } = string.Empty;

        [Required]
        public string OptionD { get; set; } = string.Empty;

        [Required]
        [MaxLength(1)]
        [RegularExpression("[ABCD]")]
        public string CorrectAnswer { get; set; } = "A";

        public string? Explanation { get; set; }

        [Range(1, 100)]
        public int Points { get; set; } = 10;

        public string? Topic { get; set; }

        [RegularExpression("Easy|Medium|Hard")]
        public string DifficultyLevel { get; set; } = "Medium";

        public int QuestionOrder { get; set; } = 1;
    }

    public class UpdateMCQQuestionDTO
    {
        public string? QuestionText { get; set; }
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }

        [MaxLength(1)]
        [RegularExpression("[ABCD]")]
        public string? CorrectAnswer { get; set; }

        public string? Explanation { get; set; }

        [Range(1, 100)]
        public int? Points { get; set; }

        public string? Topic { get; set; }
        public string? DifficultyLevel { get; set; }
        public int? QuestionOrder { get; set; }
    }

    public class MCQQuestionDTO
    {
        public int Id { get; set; }
        public int CompetitionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string OptionA { get; set; } = string.Empty;
        public string OptionB { get; set; } = string.Empty;
        public string OptionC { get; set; } = string.Empty;
        public string OptionD { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? Explanation { get; set; }
        public int Points { get; set; }
        public string? Topic { get; set; }
        public string DifficultyLevel { get; set; } = "Medium";
        public int QuestionOrder { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ImportQuestionsDTO
    {
        [Required]
        public List<CreateMCQQuestionDTO> Questions { get; set; } = new();
    }

    // ===== Team Registration Management DTOs =====

    public class TeamRegistrationDTO
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public int ClanId { get; set; }
        public string ClanName { get; set; } = string.Empty;
        public int LeaderId { get; set; }
        public string LeaderName { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public List<CompetitionTeamMemberDTO> Members { get; set; } = new();
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public DateTime RegisteredAt { get; set; }
        public string? RejectionReason { get; set; }
        public bool HasParticipated { get; set; }
        public int TotalScore { get; set; }
    }

    public class CompetitionTeamMemberDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? Role { get; set; }
    }

    public class TeamApprovalDTO
    {
        [Required]
        [RegularExpression("Approved|Rejected")]
        public string Action { get; set; } = "Approved";

        public string? RejectionReason { get; set; }
    }

    public class BulkTeamApprovalDTO
    {
        [Required]
        public List<int> TeamIds { get; set; } = new();

        [Required]
        [RegularExpression("Approved|Rejected")]
        public string Action { get; set; } = "Approved";

        public string? RejectionReason { get; set; }
    }

    // ===== Submission Monitoring DTOs =====

    public class TeamSubmissionDTO
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public int ClanId { get; set; }
        public string ClanName { get; set; } = string.Empty;
        public bool HasSubmitted { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public int TotalScore { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public int TimeTakenSeconds { get; set; }
        public List<AnswerDetailDTO>? Answers { get; set; }
    }

    public class AnswerDetailDTO
    {
        public int QuestionId { get; set; }
        public int QuestionOrder { get; set; }
        public string SubmittedAnswer { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int PointsAwarded { get; set; }
    }

    // ===== Competition Analytics DTOs =====

    public class CompetitionAnalyticsDTO
    {
        public int CompetitionId { get; set; }
        public string CompetitionTitle { get; set; } = string.Empty;
        public int TotalRegisteredTeams { get; set; }
        public int TotalSubmissions { get; set; }
        public decimal SubmissionRate { get; set; }
        public decimal AverageScore { get; set; }
        public decimal HighestScore { get; set; }
        public decimal LowestScore { get; set; }
        public int AverageTimeTakenSeconds { get; set; }
        public List<QuestionAnalyticsDTO> QuestionStats { get; set; } = new();
        public List<TopTeamDTO> TopTeams { get; set; } = new();
        public List<SubmissionTimeDistributionDTO> TimeDistribution { get; set; } = new();
    }

    public class QuestionAnalyticsDTO
    {
        public int QuestionId { get; set; }
        public int QuestionOrder { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public int TotalAttempts { get; set; }
        public int CorrectAttempts { get; set; }
        public decimal CorrectRate { get; set; }
        public string MostSelectedOption { get; set; } = string.Empty;
    }

    public class TopTeamDTO
    {
        public int Rank { get; set; }
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string ClanName { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TimeTakenSeconds { get; set; }
    }

    public class SubmissionTimeDistributionDTO
    {
        public string TimeBucket { get; set; } = string.Empty; // e.g., "0-5 min", "5-10 min"
        public int Count { get; set; }
    }

    // ===== Competition List DTO =====

    public class AdminCompetitionListDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string CompetitionPeriod { get; set; } = "Weekly";
        public string CompetitionType { get; set; } = "ProgrammingMCQ";
        public int MaxTeamsPerClan { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Upcoming";
        public int TotalTeams { get; set; }
        public int TotalQuestions { get; set; }
        public int TotalSubmissions { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ===== Announcement/Notification DTOs =====

    public class CreateCompetitionAnnouncementDTO
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Message { get; set; } = string.Empty;

        [RegularExpression("All|RegisteredTeams|SpecificClans")]
        public string TargetAudience { get; set; } = "All";

        public List<int>? TargetClanIds { get; set; }
    }
}
