using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ClanVsClansCompetitionParticipants")]
    public class ClanVsClansCompetitionParticipant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CompetitionId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ClanId { get; set; }

        // Participation status
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Selected"; // Selected, Started, Completed, Disqualified

        // Timestamps
        public DateTime SelectedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Performance
        public int Score { get; set; } = 0;
        public int CorrectAnswers { get; set; } = 0;
        public int WrongAnswers { get; set; } = 0;
        public int UnansweredQuestions { get; set; } = 0;
        public int? TimeTakenSeconds { get; set; }

        // Answer tracking
        public string? AnswerSubmissions { get; set; } // JSON: [{"questionId": 1, "answer": "A", "isCorrect": true}]

        // Navigation Properties
        [ForeignKey("CompetitionId")]
        public virtual ClanVsClansCompetition? Competition { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("ClanId")]
        public virtual Clan? Clan { get; set; }
    }
}
