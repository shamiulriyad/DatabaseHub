using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Type { get; set; } = null!; // NewAnnouncement, JoinRequestAccepted, JoinRequestRejected, RoleChanged, NewPost, NewComment, Mention, etc.

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Message { get; set; } = null!;

        public string? ActionUrl { get; set; } // URL to navigate when clicked

        // Related Entity IDs
        public int? ClanId { get; set; }
        public int? AnnouncementId { get; set; }
        public int? PostId { get; set; }
        public int? CommentId { get; set; }
        public int? FromUserId { get; set; } // User who triggered the notification

        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("ClanId")]
        public virtual Clan? Clan { get; set; }

        [ForeignKey("FromUserId")]
        public virtual User? FromUser { get; set; }
    }
}
