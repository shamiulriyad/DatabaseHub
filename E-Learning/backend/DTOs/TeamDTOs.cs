using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class TeamCreateDTO
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        public int ClanId { get; set; }
    }

    public class TeamInfoDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int ClanId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<TeamMemberDTO> Members { get; set; } = new List<TeamMemberDTO>();
    }

    public class TeamMemberDTO
    {
        public int Id { get; set; }
        public int TeamId { get; set; }
        public int UserId { get; set; }
        public DateTime JoinedAt { get; set; }
        public string? UserName { get; set; }
    }

    public class AddTeamMemberDTO
    {
        [Required]
        public int TeamId { get; set; }

        [Required]
        public int UserId { get; set; }
    }

    public class RemoveTeamMemberDTO
    {
        [Required]
        public int TeamId { get; set; }

        [Required]
        public int UserId { get; set; }
    }

    public class CompetitionRegisterTeamDTO
    {
        [Required]
        public int CompetitionId { get; set; }

        [Required]
        public int TeamId { get; set; }
    }
}
