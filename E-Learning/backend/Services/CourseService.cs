using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _context;

        public CourseService(ApplicationDbContext context)
        {
            _context = context;
        }

        public Task<ServiceResult<PaginatedResponse<CourseDTO>>> GetAllCourses(string? search, int? universityId, int? departmentId, string? difficulty, bool? isFree, string? status, string? sortBy, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<CourseDetailDTO>> GetCourseById(int id, int? userId)
            => Task.FromResult(ServiceResult<CourseDetailDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<CourseDTO>>> GetCoursesByUniversity(int universityId, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<CourseDTO>>> GetCoursesByDepartment(int departmentId, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult("Not implemented"));

        public async Task<ServiceResult<List<CourseDTO>>> GetPopularCourses()
        {
            try
            {
                var courses = await _context.Courses
                    .AsNoTracking()
                    .Where(c => c.Status == "Approved" || c.Status == "Published")
                    .OrderByDescending(c => c.EnrollmentCount)
                    .ThenByDescending(c => c.AverageRating)
                    .ThenByDescending(c => c.TotalReviews)
                    .ThenByDescending(c => c.PublishedAt ?? c.CreatedAt)
                    .Take(12)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        ShortDescription = c.ShortDescription,
                        ThumbnailUrl = c.ThumbnailUrl,
                        UniversityId = c.UniversityId,
                        UniversityName = c.University.Name,
                        DepartmentId = c.DepartmentId,
                        DepartmentName = c.Department.Name,
                        TeacherId = c.TeacherId,
                        TeacherName = (c.Teacher.FirstName + " " + c.Teacher.LastName).Trim(),
                        CourseCode = c.CourseCode,
                        CourseType = c.CourseType,
                        IsFree = c.IsFree,
                        Price = c.Price,
                        DiscountPrice = c.DiscountPrice,
                        DurationHours = c.DurationHours,
                        DifficultyLevel = c.DifficultyLevel,
                        EnrollmentCount = c.EnrollmentCount,
                        AverageRating = c.AverageRating,
                        TotalReviews = c.TotalReviews,
                        Status = c.Status,
                        CreatedAt = c.CreatedAt,
                        PublishedAt = c.PublishedAt,
                        IsEnrolled = false,
                        ProgressPercentage = null
                    })
                    .ToListAsync();

                return ServiceResult<List<CourseDTO>>.SuccessResult(courses);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CourseDTO>>.FailureResult($"Failed to get popular courses: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<CourseDTO>>> GetTrendingCourses()
        {
            try
            {
                var cutoff = DateTime.UtcNow.AddDays(-30);

                var courses = await _context.Courses
                    .AsNoTracking()
                    .Where(c => c.Status == "Approved" || c.Status == "Published")
                    .Where(c => (c.PublishedAt ?? c.CreatedAt) >= cutoff)
                    .OrderByDescending(c => c.ViewCount)
                    .ThenByDescending(c => c.EnrollmentCount)
                    .ThenByDescending(c => c.AverageRating)
                    .ThenByDescending(c => c.PublishedAt ?? c.CreatedAt)
                    .Take(12)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        ShortDescription = c.ShortDescription,
                        ThumbnailUrl = c.ThumbnailUrl,
                        UniversityId = c.UniversityId,
                        UniversityName = c.University.Name,
                        DepartmentId = c.DepartmentId,
                        DepartmentName = c.Department.Name,
                        TeacherId = c.TeacherId,
                        TeacherName = (c.Teacher.FirstName + " " + c.Teacher.LastName).Trim(),
                        CourseCode = c.CourseCode,
                        CourseType = c.CourseType,
                        IsFree = c.IsFree,
                        Price = c.Price,
                        DiscountPrice = c.DiscountPrice,
                        DurationHours = c.DurationHours,
                        DifficultyLevel = c.DifficultyLevel,
                        EnrollmentCount = c.EnrollmentCount,
                        AverageRating = c.AverageRating,
                        TotalReviews = c.TotalReviews,
                        Status = c.Status,
                        CreatedAt = c.CreatedAt,
                        PublishedAt = c.PublishedAt,
                        IsEnrolled = false,
                        ProgressPercentage = null
                    })
                    .ToListAsync();

                // If there are no recent courses yet, fall back to overall trending by views.
                if (courses.Count == 0)
                {
                    courses = await _context.Courses
                        .AsNoTracking()
                        .Where(c => c.Status == "Approved" || c.Status == "Published")
                        .OrderByDescending(c => c.ViewCount)
                        .ThenByDescending(c => c.EnrollmentCount)
                        .ThenByDescending(c => c.AverageRating)
                        .ThenByDescending(c => c.PublishedAt ?? c.CreatedAt)
                        .Take(12)
                        .Select(c => new CourseDTO
                        {
                            Id = c.Id,
                            Title = c.Title,
                            ShortDescription = c.ShortDescription,
                            ThumbnailUrl = c.ThumbnailUrl,
                            UniversityId = c.UniversityId,
                            UniversityName = c.University.Name,
                            DepartmentId = c.DepartmentId,
                            DepartmentName = c.Department.Name,
                            TeacherId = c.TeacherId,
                            TeacherName = (c.Teacher.FirstName + " " + c.Teacher.LastName).Trim(),
                            CourseCode = c.CourseCode,
                            CourseType = c.CourseType,
                            IsFree = c.IsFree,
                            Price = c.Price,
                            DiscountPrice = c.DiscountPrice,
                            DurationHours = c.DurationHours,
                            DifficultyLevel = c.DifficultyLevel,
                            EnrollmentCount = c.EnrollmentCount,
                            AverageRating = c.AverageRating,
                            TotalReviews = c.TotalReviews,
                            Status = c.Status,
                            CreatedAt = c.CreatedAt,
                            PublishedAt = c.PublishedAt,
                            IsEnrolled = false,
                            ProgressPercentage = null
                        })
                        .ToListAsync();
                }

                return ServiceResult<List<CourseDTO>>.SuccessResult(courses);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CourseDTO>>.FailureResult($"Failed to get trending courses: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<CourseDTO>>> GetNewCourses()
        {
            try
            {
                var courses = await _context.Courses
                    .AsNoTracking()
                    .Where(c => c.Status == "Approved" || c.Status == "Published")
                    .OrderByDescending(c => c.PublishedAt ?? c.CreatedAt)
                    .Take(12)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        ShortDescription = c.ShortDescription,
                        ThumbnailUrl = c.ThumbnailUrl,
                        UniversityId = c.UniversityId,
                        UniversityName = c.University.Name,
                        DepartmentId = c.DepartmentId,
                        DepartmentName = c.Department.Name,
                        TeacherId = c.TeacherId,
                        TeacherName = (c.Teacher.FirstName + " " + c.Teacher.LastName).Trim(),
                        CourseCode = c.CourseCode,
                        CourseType = c.CourseType,
                        IsFree = c.IsFree,
                        Price = c.Price,
                        DiscountPrice = c.DiscountPrice,
                        DurationHours = c.DurationHours,
                        DifficultyLevel = c.DifficultyLevel,
                        EnrollmentCount = c.EnrollmentCount,
                        AverageRating = c.AverageRating,
                        TotalReviews = c.TotalReviews,
                        Status = c.Status,
                        CreatedAt = c.CreatedAt,
                        PublishedAt = c.PublishedAt,
                        IsEnrolled = false,
                        ProgressPercentage = null
                    })
                    .ToListAsync();

                return ServiceResult<List<CourseDTO>>.SuccessResult(courses);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CourseDTO>>.FailureResult($"Failed to get new courses: {ex.Message}");
            }
        }

        public Task<ServiceResult<PaginatedResponse<CourseDTO>>> GetCoursesByTeacher(int teacherId, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<CourseDTO>> CreateCourse(CourseCreateDTO dto, int teacherId)
            => Task.FromResult(ServiceResult<CourseDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<CourseDTO>> UpdateCourse(int id, int userId, string userRole, CourseUpdateDTO dto)
            => Task.FromResult(ServiceResult<CourseDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<CourseDTO>> UpdateCourseStatus(int id, int adminId, UpdateCourseStatusDTO dto)
            => Task.FromResult(ServiceResult<CourseDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<EnrollmentDTO>> EnrollInCourse(int userId, int courseId)
            => Task.FromResult(ServiceResult<EnrollmentDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<EnrollmentDTO>>> GetUserEnrolledCourses(int userId, string? status, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<EnrollmentDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<CourseDTO>>> GetUserCreatedCourses(int userId, string? status, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<ModuleDTO>>> GetCourseModules(int courseId)
            => Task.FromResult(ServiceResult<List<ModuleDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<ReviewDTO>>> GetCourseReviews(int courseId, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<ReviewDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<CourseDTO>>> SearchCourses(string query, int? universityId, int? departmentId, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<CourseDTO>>> FilterCourses(CourseFilterDTO filter, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> DeleteCourse(int id, int userId, string userRole)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<CourseStatsDTO>> GetCourseStats(int courseId)
            => Task.FromResult(ServiceResult<CourseStatsDTO>.FailureResult("Not implemented"));
    }
}
