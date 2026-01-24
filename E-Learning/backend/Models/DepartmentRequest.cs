using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class DepartmentRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UniversityId { get; set; }

        [Required]
        [MaxLength(200)]
        public string DepartmentName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ShortCode { get; set; }

        public int RequestedBy { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending | Approved | Rejected

        [MaxLength(1000)]
        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }
    }
}
