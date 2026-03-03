// DTOs/CommunityDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Post Create
    public class CreatePostDTO
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        public int? UniversityId { get; set; }
        public int? DepartmentId { get; set; }
        public int? CourseId { get; set; }
        public int? ClanId { get; set; }

        [Required]
        [MaxLength(20)]
        public string PostType { get; set; } = "Discussion";

        [MaxLength(20)]
        public string? Type { get; set; }

        public bool IsExamRelated { get; set; } = false;
        public List<string>? ExamTags { get; set; }
        public string? Subject { get; set; }
        public string? MediaUrl { get; set; }
        public string? MediaType { get; set; }
        public List<string>? Tags { get; set; }
        // Optional section marker (e.g. AdminForum) to scope posts to a specific community area
        [MaxLength(50)]
        public string? SectionType { get; set; }
    }

    // Post Update
    public class UpdatePostDTO
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Content { get; set; }
        public string? PostType { get; set; }
        public string? Type { get; set; }
        public bool? IsExamRelated { get; set; }
        public List<string>? ExamTags { get; set; }
        public string? Subject { get; set; }
        public string? MediaUrl { get; set; }
        public string? MediaType { get; set; }
        public List<string>? Tags { get; set; }
        [MaxLength(50)]
        public string? SectionType { get; set; }
    }

    // Post Response
    public class PostDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int? UniversityId { get; set; }
        public string? UniversityName { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int? CourseId { get; set; }
        public string? CourseTitle { get; set; }
        public int? ClanId { get; set; }
        public string? ClanName { get; set; }
        public string PostType { get; set; }
        public string Type { get; set; }
        public bool IsExamRelated { get; set; }
        public List<string> ExamTags { get; set; }
        public string? Subject { get; set; }
        public string? MediaUrl { get; set; }
        public string? MediaType { get; set; }
        public int UpvoteCount { get; set; }
        public int DownvoteCount { get; set; }
        public int CommentCount { get; set; }
        public int ViewCount { get; set; }
        public int ShareCount { get; set; }
        public bool IsPinned { get; set; }
        public bool IsClosed { get; set; }
        public bool IsReported { get; set; }
        public int? BestAnswerId { get; set; }
        public bool HasTeacherAnswer { get; set; }
        public int? TeacherAnswerId { get; set; }
        public bool HasUpvoted { get; set; }
        public bool HasDownvoted { get; set; }
        public List<string> Tags { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastActivity { get; set; }
        // Optional section marker present when a post belongs to a special area
        public string? SectionType { get; set; }
    }

    // Post Detail
    public class PostDetailDTO : PostDTO
    {
        public UserDTO Author { get; set; }
        public List<CommentDTO> Comments { get; set; }
        public CommentDTO? BestAnswer { get; set; }
        public CommentDTO? TeacherAnswer { get; set; }
        public List<RelatedPostDTO> RelatedPosts { get; set; }
    }

    // Comment Create
    public class CreateCommentDTO
    {
        [Required]
        public string Content { get; set; }

        public int? ParentCommentId { get; set; }
        public bool IsAnswer { get; set; } = false;
    }

    // Simple add-comment alias to satisfy service signatures
    public class AddCommentDTO : CreateCommentDTO { }

    // Comment Update
    public class UpdateCommentDTO
    {
        [Required]
        public string Content { get; set; }
    }

    // Comment Response
    public class CommentDTO
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int PostId { get; set; }
        public int? ParentCommentId { get; set; }
        public int Depth { get; set; }
        public int UpvoteCount { get; set; }
        public int DownvoteCount { get; set; }
        public int ReplyCount { get; set; }
        public bool IsAnswer { get; set; }
        public bool IsTeacherAnswer { get; set; }
        public bool IsBestAnswer { get; set; }
        public bool HasUpvoted { get; set; }
        public bool HasDownvoted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<CommentDTO> Replies { get; set; }
    }

    public class VoteDTO
    {
        [Required]
        public string VoteType { get; set; } // up or down
    }

    public class VoteResponseDTO
    {
        public int UpvoteCount { get; set; }
        public int DownvoteCount { get; set; }
        public bool HasUpvoted { get; set; }
        public bool HasDownvoted { get; set; }
    }

    public class PostReactionDTO
    {
        [Required]
        [MaxLength(30)]
        public string Reaction { get; set; } = null!;
    }

    // Related Post
    public class RelatedPostDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string PostType { get; set; }
        public int CommentCount { get; set; }
        public int UpvoteCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Report Content
    public class ReportContentDTO
    {
        [Required]
        [MaxLength(50)]
        public string Reason { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }
    }

    // Resolve Report
    public class ResolveReportDTO
    {
        [Required]
        [MaxLength(20)]
        public string Action { get; set; } // Dismiss, RemoveContent, WarnUser, BanUser

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    // Community Statistics
    public class CommunityStatsDTO
    {
        public int TotalPosts { get; set; }
        public int TotalComments { get; set; }
        public int TotalQuestions { get; set; }
        public int TotalAnswers { get; set; }
        public int TotalExamRelated { get; set; }
        public int ActiveUsers { get; set; }
        public Dictionary<string, int> PostTypeDistribution { get; set; }
        public List<TopContributorDTO> TopContributors { get; set; }
        public List<PopularPostDTO> PopularPosts { get; set; }
    }

    public class TopContributorDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? ProfileImage { get; set; }
        public int PostCount { get; set; }
        public int CommentCount { get; set; }
        public int AnswerCount { get; set; }
        public int UpvoteCount { get; set; }
        public DateTime LastActivity { get; set; }
    }

    public class PopularPostDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string PostType { get; set; }
        public int ViewCount { get; set; }
        public int UpvoteCount { get; set; }
        public int CommentCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Aliases for consistency
    public class PostCreateDTO : CreatePostDTO { }
    public class CommentCreateDTO : CreateCommentDTO { }

    // Report DTO
    public class ReportDTO
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public int ReportedByUserId { get; set; }
        public string Reason { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}