using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("CompetitionQuestions")]
    public class CompetitionQuestion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CompetitionId { get; set; }

        [Required]
        [Column(TypeName = "text")]
        public string QuestionText { get; set; } = null!;

        // Multiple choice options
        [Required]
        public string OptionA { get; set; } = null!;

        [Required]
        public string OptionB { get; set; } = null!;

        [Required]
        public string OptionC { get; set; } = null!;

        [Required]
        public string OptionD { get; set; } = null!;

        // Correct answer: "A", "B", "C", or "D"
        [Required]
        [MaxLength(1)]
        public string CorrectAnswer { get; set; } = null!;

        public int Points { get; set; } = 1;

        public int Order { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("CompetitionId")]
        public virtual Competition Competition { get; set; } = null!;
    }
}
