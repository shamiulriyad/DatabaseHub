namespace backend.DTOs
{
    public class CreateUniversityRequestDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Website { get; set; }
    }

    public class UniversityRequestAdminDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Website { get; set; }
        public int RequestedBy { get; set; }
        public string Status { get; set; } = "Pending";
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
    }
}
