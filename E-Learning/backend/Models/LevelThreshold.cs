using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("LevelThresholds")]
    public class LevelThreshold
    {
        [Key]
        public int Level { get; set; }

        [Required]
        public long RequiredExp { get; set; }
    }
}
