using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class UniversityRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(200)]
        public string? Website { get; set; }

        public int RequestedBy { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending | Approved | Rejected

        [MaxLength(1000)]
        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }
    }
}
