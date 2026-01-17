using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Clans")]
    public class Clan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        [MaxLength(10)]
        public string Tag { get; set; } = null!; // Short code like "DEV", "CS", "MATH", "TOP1"

        [Required]
        [Column(TypeName = "text")]
        public string Description { get; set; } = null!;

        [Required]
        public int LeaderId { get; set; }

        // Clan Identity
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Motto { get; set; }

        // Clan Type
        [Required]
        [MaxLength(20)]
        public string ClanType { get; set; } = "Academic"; // Academic, Competitive, Social, StudyGroup

        // Focus Area
        public int? UniversityId { get; set; }
        public int? DepartmentId { get; set; }
        public int? CourseId { get; set; }
        public string? FocusSubjects { get; set; } // JSON array

        // Settings
        public bool IsPublic { get; set; } = true;
        public bool RequireApproval { get; set; } = false;
        public int MaxMembers { get; set; } = 100;
        public string? JoinCriteria { get; set; } // Minimum rank, points, etc.

        // Stats for Ranking
        public int MemberCount { get; set; } = 1;
        public int TotalPoints { get; set; } = 0;
        public int WeeklyPoints { get; set; } = 0;
        public int MonthlyPoints { get; set; } = 0;
        public int Rank { get; set; } = 0;

        // Activity
        public int TotalCompetitions { get; set; } = 0;
        public int CompetitionWins { get; set; } = 0;
        public int TotalPosts { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastActivity { get; set; }

        // Navigation Properties
        [ForeignKey("LeaderId")]
        public virtual User Leader { get; set; } = null!;

        [ForeignKey("UniversityId")]
        public virtual University? University { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }

        [ForeignKey("CourseId")]
        public virtual Course? Course { get; set; }

        public virtual ICollection<ClanMember> Members { get; set; } = new List<ClanMember>();
        public virtual ICollection<Competition> Competitions { get; set; } = new List<Competition>();
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        
        // Clan vs Clan Competitions
        public virtual ICollection<ClanVsClansCompetition> ChallengedCompetitions { get; set; } = new List<ClanVsClansCompetition>();
        public virtual ICollection<ClanVsClansCompetition> OpponentCompetitions { get; set; } = new List<ClanVsClansCompetition>();
        public virtual ICollection<ClanVsClansCompetitionParticipant> CompetitionParticipants { get; set; } = new List<ClanVsClansCompetitionParticipant>();
    }
}