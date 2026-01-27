using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IReviewService
    {
        Task<ServiceResult<ReviewDTO>> CreateReview(CreateReviewDTO dto, int userId);
        Task<ServiceResult<ReviewDTO>> CreateReviewForCourse(int courseId, CreateReviewDTO dto, int userId);
        Task<ServiceResult<ReviewDTO>> GetReviewById(int reviewId);
        Task<ServiceResult<List<ReviewDTO>>> GetCourseReviews(int courseId, int page, int pageSize);
        Task<ServiceResult<List<ReviewDTO>>> GetTeacherReviews(int teacherId, string? sortBy, int page, int pageSize);
        Task<ServiceResult<ReviewDTO>> UpdateReview(int reviewId, UpdateReviewDTO dto);
        Task<ServiceResult<bool>> DeleteReview(int reviewId);
        Task<ServiceResult<bool>> ApproveReview(int reviewId, int adminId);
        Task<ServiceResult<bool>> RejectReview(int reviewId, int adminId, string reason);
        Task<ServiceResult<List<ReviewDTO>>> GetUserReviews(int userId, int page, int pageSize);
        Task<ServiceResult<decimal>> GetCourseAverageRating(int courseId);
        Task<ServiceResult<decimal>> GetTeacherAverageRating(int teacherId);
        Task<ServiceResult<ReviewStatsDTO>> GetReviewStats(int? courseId, int? teacherId);
        Task<ServiceResult<bool>> LikeReview(int reviewId, int userId);
        Task<ServiceResult<bool>> UnlikeReview(int reviewId, int userId);
    }
}
