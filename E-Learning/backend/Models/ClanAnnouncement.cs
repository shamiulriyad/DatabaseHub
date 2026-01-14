using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ClanAnnouncements")]
    public class ClanAnnouncement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClanId { get; set; }

        [Required]
        public int UserId { get; set; } // Leader or Co-Leader who posted

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        [Column(TypeName = "text")]
        public string Content { get; set; } = null!;

        [MaxLength(50)]
        public string? Type { get; set; } = "General"; // General, Competition, Deadline, Important, Event

        public bool IsPinned { get; set; } = false;
        public int ViewCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("ClanId")]
        public virtual Clan Clan { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public virtual ICollection<ClanAnnouncementReaction> Reactions { get; set; } = new List<ClanAnnouncementReaction>();
    }

    [Table("ClanAnnouncementReactions")]
    public class ClanAnnouncementReaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AnnouncementId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(10)]
        public string Emoji { get; set; } = null!; // 👍, 👎, ❤️, 🎉, 😊, 🔥, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("AnnouncementId")]
        public virtual ClanAnnouncement Announcement { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }

    [Table("PostReactions")]
    public class PostReaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PostId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(10)]
        public string Emoji { get; set; } = null!; // 👍, 👎, ❤️, 🎉, 😊, 🔥, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PostId")]
        public virtual Post Post { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
