// DTOs/ReviewDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Create Review
    public class CreateReviewDTO
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        public string Comment { get; set; }

        public int? ContentRating { get; set; }
        public int? TeachingRating { get; set; }
        public int? ExamPreparationRating { get; set; }
        public int? MaterialQualityRating { get; set; }
        public string? Pros { get; set; }
        public string? Cons { get; set; }
        public string? Suggestions { get; set; }
    }

    // Update Review
    public class UpdateReviewDTO
    {
        [Range(1, 5)]
        public int? Rating { get; set; }

        public string? Comment { get; set; }
        public int? ContentRating { get; set; }
        public int? TeachingRating { get; set; }
        public int? ExamPreparationRating { get; set; }
        public int? MaterialQualityRating { get; set; }
        public string? Pros { get; set; }
        public string? Cons { get; set; }
        public string? Suggestions { get; set; }
    }

    // Respond to Review
    public class RespondToReviewDTO
    {
        [Required]
        public string Response { get; set; }
    }

    // Reject Review
    public class RejectReviewDTO
    {
        [Required]
        public string Reason { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    // Review Response
    public class ReviewDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public int? ContentRating { get; set; }
        public int? TeachingRating { get; set; }
        public int? ExamPreparationRating { get; set; }
        public int? MaterialQualityRating { get; set; }
        public string? Pros { get; set; }
        public string? Cons { get; set; }
        public string? Suggestions { get; set; }
        public int HelpfulCount { get; set; }
        public int UnhelpfulCount { get; set; }
        public bool HasTeacherResponse { get; set; }
        public string? TeacherResponse { get; set; }
        public DateTime? TeacherRespondedAt { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public bool IsReported { get; set; }
        public bool IsApproved { get; set; }
        public bool IsHelpful { get; set; }
        public bool IsUnhelpful { get; set; }
        public bool IsMyReview { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // Review Stats
    public class ReviewStatsDTO
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int TotalReviews { get; set; }
        public decimal AverageRating { get; set; }
        public int FiveStarCount { get; set; }
        public int FourStarCount { get; set; }
        public int ThreeStarCount { get; set; }
        public int TwoStarCount { get; set; }
        public int OneStarCount { get; set; }
        public decimal AverageContentRating { get; set; }
        public decimal AverageTeachingRating { get; set; }
        public decimal AverageExamPreparationRating { get; set; }
        public decimal AverageMaterialQualityRating { get; set; }
        public Dictionary<string, int> RatingDistribution { get; set; }
        public List<TopReviewDTO> TopHelpfulReviews { get; set; }
        public List<RecentReviewDTO> RecentReviews { get; set; }
    }

    public class TopReviewDTO
    {
        public ReviewDTO Review { get; set; }
        public int HelpfulCount { get; set; }
        public int TotalVotes { get; set; }
        public decimal HelpfulPercentage { get; set; }
    }

    public class RecentReviewDTO
    {
        public ReviewDTO Review { get; set; }
        public bool HasResponse { get; set; }
        public int ReplyCount { get; set; }
    }

    public class SubmitRatingDTO
    {
        public int Rating { get; set; }
        public string? Review { get; set; }
    }
}