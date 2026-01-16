using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Competitions")]
    public class Competition
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        [Column(TypeName = "text")]
        public string Description { get; set; }

        // Competition Type
        [Required]
        [MaxLength(20)]
        public string CompetitionType { get; set; } = "Quiz"; // Quiz, Assignment, Programming, Essay, Debate

        // Scope (Multi-level competition)
        public int? UniversityId { get; set; }
        public int? DepartmentId { get; set; }
        public int? CourseId { get; set; }
        public int? ClanId { get; set; }

        // Timing
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DurationMinutes { get; set; } = 60;
        public bool IsLive { get; set; } = false;

        // Rules
        public int MaxParticipants { get; set; } = 100;
        public bool IsTeamBased { get; set; } = false;
        public int TeamSize { get; set; } = 1;
        public bool AllowMultipleAttempts { get; set; } = false;

        // Visibility
        public bool IsPublic { get; set; } = true;
        public string? AllowedMemberIds { get; set; } // Comma-separated user IDs for private competitions
        public string? AllowedClanIds { get; set; } // Comma-separated clan IDs for clan-based participation
        public int? PointRangeMin { get; set; } // Minimum points required for participation (for clan members)
        public int? PointRangeMax { get; set; } // Maximum points allowed for participation (for clan members)

        // Content
        public int? QuizId { get; set; }
        public int? AssignmentId { get; set; }
        public string? CompetitionRules { get; set; } // JSON

        // Scoring
        public int TotalQuestions { get; set; } = 0;
        public int MaxScore { get; set; } = 100;
        public string? ScoringSystem { get; set; } // JSON
        public bool ShowLeaderboard { get; set; } = true;

        // Prizes (Competition driven)
        public string? PrizeDescription { get; set; }
        public decimal? PrizeAmount { get; set; }
        public string? PrizeBadge { get; set; }
        public int PrizePoints { get; set; } = 100;

        // Creator & Approval
        public int CreatorId { get; set; }
        [MaxLength(20)]
        public string CreatorRole { get; set; } = "Student"; // Student, Teacher, Admin, ClanLeader
        public bool IsApproved { get; set; } = true; // Default approved; students set to false
        public int? ApprovedBy { get; set; } // Admin user ID who approved
        public DateTime? ApprovedAt { get; set; }

        // Status
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Upcoming"; // Upcoming, Ongoing, Completed, Cancelled, PendingApproval

        // Season Context
        public int Season { get; set; } = 1; // Season number for tracking season-specific leaderboards and points

        // Stats
        public int ParticipantCount { get; set; } = 0;
        public int ViewCount { get; set; } = 0;

        // Ranking Points for winners
        public int FirstPlacePoints { get; set; } = 50;
        public int SecondPlacePoints { get; set; } = 30;
        public int ThirdPlacePoints { get; set; } = 20;
        public int ParticipationPoints { get; set; } = 5;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("CreatorId")]
        public virtual User? Creator { get; set; }

        [ForeignKey("UniversityId")]
        public virtual University? University { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }

        [ForeignKey("CourseId")]
        public virtual Course? Course { get; set; }

        [ForeignKey("ClanId")]
        public virtual Clan? Clan { get; set; }

        [ForeignKey("QuizId")]
        public virtual Quiz? Quiz { get; set; }

        [ForeignKey("AssignmentId")]
        public virtual Assignment? Assignment { get; set; }

        public virtual ICollection<CompetitionParticipant> Participants { get; set; } = new List<CompetitionParticipant>();
        public virtual ICollection<CompetitionScore> Scores { get; set; } = new List<CompetitionScore>();
        public virtual ICollection<CompetitionQuestion> Questions { get; set; } = new List<CompetitionQuestion>();
    }
}