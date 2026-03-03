using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("UserCompetitionHistories")]
    public class UserCompetitionHistory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int CompetitionId { get; set; }

        [Required]
        public int ClanTeamId { get; set; }

        [Required]
        public int Position { get; set; }

        [Required]
        public int EarnedExp { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("CompetitionId")]
        public virtual Competition Competition { get; set; } = null!;

        [ForeignKey("ClanTeamId")]
        public virtual Team ClanTeam { get; set; } = null!;
    }
}
