using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext _context;

        public ReviewService(ApplicationDbContext context)
        {
            _context = context;
        }

        public Task<ServiceResult<ReviewDTO>> CreateReview(CreateReviewDTO dto, int userId)
            => Task.FromResult(ServiceResult<ReviewDTO>.FailureResult("Not implemented"));

        public async Task<ServiceResult<ReviewDTO>> CreateReviewForCourse(int courseId, CreateReviewDTO dto, int userId)
        {
            try
            {
                var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
                if (course == null) return ServiceResult<ReviewDTO>.FailureResult("Course not found");

                var review = new Models.Review
                {
                    CourseId = courseId,
                    UserId = userId,
                    Rating = dto.Rating,
                    Comment = dto.Comment ?? dto.Pros ?? dto.Suggestions ?? "",
                    ContentRating = dto.ContentRating,
                    TeachingRating = dto.TeachingRating,
                    ExamPreparationRating = dto.ExamPreparationRating,
                    MaterialQualityRating = dto.MaterialQualityRating,
                    CreatedAt = DateTime.UtcNow,
                    IsApproved = true
                };

                _context.Reviews.Add(review);

                // Update course aggregates
                var previousCount = course.TotalReviews;
                var previousAvg = course.AverageRating;
                var newCount = previousCount + 1;
                var newAvg = (previousAvg * previousCount + dto.Rating) / Math.Max(1, newCount);
                course.TotalReviews = newCount;
                course.AverageRating = newAvg;

                await _context.SaveChangesAsync();

                var dtoRes = new ReviewDTO
                {
                    Id = review.Id,
                    UserId = review.UserId,
                    UserName = review.User?.FirstName + " " + review.User?.LastName,
                    ProfileImageUrl = review.User?.ProfileImageUrl,
                    CourseId = review.CourseId,
                    CourseTitle = course.Title,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    ContentRating = review.ContentRating,
                    TeachingRating = review.TeachingRating,
                    ExamPreparationRating = review.ExamPreparationRating,
                    MaterialQualityRating = review.MaterialQualityRating,
                    HelpfulCount = review.HelpfulCount,
                    UnhelpfulCount = review.UnhelpfulCount,
                    HasTeacherResponse = review.HasTeacherResponse,
                    TeacherResponse = review.TeacherResponse,
                    TeacherRespondedAt = review.TeacherRespondedAt,
                    IsVerifiedPurchase = review.IsVerifiedPurchase,
                    IsReported = review.IsReported,
                    IsApproved = review.IsApproved,
                    CreatedAt = review.CreatedAt
                };

                return ServiceResult<ReviewDTO>.SuccessResult(dtoRes);
            }
            catch (Exception ex)
            {
                return ServiceResult<ReviewDTO>.FailureResult($"Failed to create review: {ex.Message}");
            }
        }

        public Task<ServiceResult<ReviewDTO>> GetReviewById(int reviewId)
            => Task.FromResult(ServiceResult<ReviewDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<ReviewDTO>>> GetCourseReviews(int courseId, int page, int pageSize)
            => Task.FromResult(ServiceResult<List<ReviewDTO>>.FailureResult("Not implemented"));

        public async Task<ServiceResult<List<ReviewDTO>>> GetTeacherReviews(int teacherId, string? sortBy, int page, int pageSize)
        {
            try
            {
                var query = _context.Reviews.AsNoTracking()
                    .Where(r => r.Course.TeacherId == teacherId && r.IsApproved)
                    .Include(r => r.User)
                    .Include(r => r.Course)
                    .AsQueryable();

                if (sortBy == "rating-high") query = query.OrderByDescending(r => r.Rating);
                else if (sortBy == "rating-low") query = query.OrderBy(r => r.Rating);
                else query = query.OrderByDescending(r => r.CreatedAt);

                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new ReviewDTO
                    {
                        Id = r.Id,
                        UserId = r.UserId,
                        UserName = (r.User.FirstName + " " + r.User.LastName).Trim(),
                        ProfileImageUrl = r.User.ProfileImageUrl,
                        CourseId = r.CourseId,
                        CourseTitle = r.Course.Title,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        HelpfulCount = r.HelpfulCount,
                        UnhelpfulCount = r.UnhelpfulCount,
                        HasTeacherResponse = r.HasTeacherResponse,
                        TeacherResponse = r.TeacherResponse,
                        TeacherRespondedAt = r.TeacherRespondedAt,
                        IsVerifiedPurchase = r.IsVerifiedPurchase,
                        IsReported = r.IsReported,
                        IsApproved = r.IsApproved,
                        CreatedAt = r.CreatedAt
                    })
                    .ToListAsync();

                return ServiceResult<List<ReviewDTO>>.SuccessResult(items);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ReviewDTO>>.FailureResult($"Failed to get teacher reviews: {ex.Message}");
            }
        }


        public Task<ServiceResult<ReviewDTO>> UpdateReview(int reviewId, UpdateReviewDTO dto)
            => Task.FromResult(ServiceResult<ReviewDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> DeleteReview(int reviewId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> ApproveReview(int reviewId, int adminId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> RejectReview(int reviewId, int adminId, string reason)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<ReviewDTO>>> GetUserReviews(int userId, int page, int pageSize)
            => Task.FromResult(ServiceResult<List<ReviewDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<decimal>> GetCourseAverageRating(int courseId)
            => Task.FromResult(ServiceResult<decimal>.FailureResult("Not implemented"));

        public Task<ServiceResult<decimal>> GetTeacherAverageRating(int teacherId)
            => Task.FromResult(ServiceResult<decimal>.FailureResult("Not implemented"));

        public Task<ServiceResult<ReviewStatsDTO>> GetReviewStats(int? courseId, int? teacherId)
            => Task.FromResult(ServiceResult<ReviewStatsDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> LikeReview(int reviewId, int userId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> UnlikeReview(int reviewId, int userId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));
    }
}
