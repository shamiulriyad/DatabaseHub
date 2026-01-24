using System;

namespace backend.DTOs
{
    public class CreateDepartmentRequestDTO
    {
        public int UniversityId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? ShortCode { get; set; }
        public string? Note { get; set; }
    }

    public class DepartmentRequestAdminDTO
    {
        public int Id { get; set; }
        public int UniversityId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? ShortCode { get; set; }
        public int RequestedBy { get; set; }
        public string Status { get; set; } = "Pending";
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
    }
}
