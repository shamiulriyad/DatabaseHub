using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("CourseParts")]
    public class CoursePart
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CourseId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Column(TypeName = "text")]
        public string? Description { get; set; }

        // Either uploaded video URL or YouTube link
        public string? VideoUrl { get; set; }
        public string? YouTubeUrl { get; set; }

        // Ordering of the part within the course
        public int Order { get; set; } = 0;

        // Whether this part is available as a preview for non-enrolled users
        public bool IsPreview { get; set; } = false;

        [ForeignKey("CourseId")]
        public virtual Course Course { get; set; } = null!;
    }
}
