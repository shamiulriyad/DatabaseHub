using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ClanVsClansCompetitions")]
    public class ClanVsClansCompetition
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Column(TypeName = "text")]
        public string? Description { get; set; }

        // Clans Involved
        [Required]
        public int ChallengerClanId { get; set; }

        [Required]
        public int OpponentClanId { get; set; }

        // Competition Configuration
        [Required]
        [MaxLength(20)]
        public string CompetitionType { get; set; } = "Programming"; // Programming, Quiz, Mixed

        [Required]
        [MaxLength(10)]
        public string DifficultyLevel { get; set; } = "Medium"; // Easy, Medium, Hard

        [Required]
        public int ParticipantsPerClan { get; set; } = 3; // Number of participants from each clan

        [Required]
        public int DurationMinutes { get; set; } = 30; // Time limit for the competition

        // Status
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Scheduled, Ongoing, Completed, Rejected, Cancelled

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ScheduledStartTime { get; set; }
        public DateTime? CompetitionStartTime { get; set; }
        public DateTime? CompetitionEndTime { get; set; }

        // Responses
        public bool ChallengerReady { get; set; } = false; // Challenger confirmed participants
        public bool OpponentReady { get; set; } = false; // Opponent confirmed participants
        public string? OpponentResponse { get; set; } = "Pending"; // Pending, Accepted, Rejected

        // Creator
        [Required]
        public int CreatedByUserId { get; set; }

        // Results
        [MaxLength(20)]
        public string? WinnerClanStatus { get; set; } = null; // "ChallengerWon", "OpponentWon", "Draw"

        public int? ChallengerTotalScore { get; set; } = 0;
        public int? OpponentTotalScore { get; set; } = 0;

        // Settings
        public bool ShowScoresToOpponent { get; set; } = true; // Real-time score visibility
        public bool AllowWithdrawal { get; set; } = false; // Can clans withdraw after starting

        // Question Bank Reference
        public string? QuestionIds { get; set; } // Comma-separated IDs of selected questions

        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("ChallengerClanId")]
        public virtual Clan? ChallengerClan { get; set; }

        [ForeignKey("OpponentClanId")]
        public virtual Clan? OpponentClan { get; set; }

        [ForeignKey("CreatedByUserId")]
        public virtual User? CreatedBy { get; set; }

        public virtual ICollection<ClanVsClansCompetitionParticipant> ChallengerParticipants { get; set; } = new List<ClanVsClansCompetitionParticipant>();
        public virtual ICollection<ClanVsClansCompetitionParticipant> OpponentParticipants { get; set; } = new List<ClanVsClansCompetitionParticipant>();
        public virtual ICollection<ClanVsClansCompetitionScore> Scores { get; set; } = new List<ClanVsClansCompetitionScore>();
        public virtual ICollection<ClanVsClansCompetitionQuestion> Questions { get; set; } = new List<ClanVsClansCompetitionQuestion>();
        public virtual ICollection<ClanVsClansCompetitionParticipant> AllParticipants { get; set; } = new List<ClanVsClansCompetitionParticipant>();
    }
}
