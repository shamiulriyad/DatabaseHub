using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ClanVsClansCompetitionScores")]
    public class ClanVsClansCompetitionScore
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CompetitionId { get; set; }

        [Required]
        public int ParticipantId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ClanId { get; set; }

        // Score details
        [Required]
        public int IndividualScore { get; set; } = 0;

        public int PointsPerCorrectAnswer { get; set; } = 10;
        public int NegativePointsPerWrongAnswer { get; set; } = 0; // Optional penalty

        // Calculated at competition end
        public int ClanContributionToTotal { get; set; } = 0;

        public DateTime ScoredAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("CompetitionId")]
        public virtual ClanVsClansCompetition? Competition { get; set; }

        [ForeignKey("ParticipantId")]
        public virtual ClanVsClansCompetitionParticipant? Participant { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("ClanId")]
        public virtual Clan? Clan { get; set; }
    }
}
