using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ClanVsClansCompetitionQuestions")]
    public class ClanVsClansCompetitionQuestion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CompetitionId { get; set; }

        [Required]
        [Column(TypeName = "text")]
        public string QuestionText { get; set; } = null!;

        // Question metadata
        [MaxLength(50)]
        public string? Topic { get; set; }

        [Required]
        [MaxLength(10)]
        public string DifficultyLevel { get; set; } = "Medium"; // Easy, Medium, Hard

        [Required]
        [MaxLength(20)]
        public string CompetitionType { get; set; } = "Programming"; // Programming, Quiz, Mixed

        // MCQ Options
        [Required]
        public string OptionA { get; set; } = null!;

        [Required]
        public string OptionB { get; set; } = null!;

        [Required]
        public string OptionC { get; set; } = null!;

        [Required]
        public string OptionD { get; set; } = null!;

        // Correct answer
        [Required]
        [MaxLength(1)]
        public string CorrectAnswer { get; set; } = null!; // A, B, C, D

        // Explanation
        [Column(TypeName = "text")]
        public string? Explanation { get; set; }

        // Scoring
        public int Points { get; set; } = 10;

        // Display order
        public int QuestionOrder { get; set; } = 1;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("CompetitionId")]
        public virtual ClanVsClansCompetition? Competition { get; set; }
    }
}
