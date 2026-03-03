using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ExpRewardRules")]
    public class ExpRewardRule
    {
        [Key]
        public int Position { get; set; }

        [Required]
        public int ExpAmount { get; set; }
    }
}
