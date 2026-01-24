using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly ApplicationDbContext _context;

        public DepartmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public Task<ServiceResult<DepartmentDTO>> CreateDepartment(CreateDepartmentDTO dto, int adminId)
        {
            // Direct department creation via service is disabled to enforce centralized management.
            // New departments must be requested using the Department Requests endpoint and approved by an Admin.
            return Task.FromResult(ServiceResult<DepartmentDTO>.FailureResult("Direct department creation is disabled. Submit a Department Add Request for approval."));
        }

        public Task<ServiceResult<DepartmentDTO>> GetDepartmentById(int departmentId)
            => Task.FromResult(ServiceResult<DepartmentDTO>.FailureResult("Not implemented"));

        public async Task<ServiceResult<List<DepartmentDTO>>> GetDepartmentsByUniversity(int universityId)
        {
            try
            {
                var departments = await _context.Departments
                    .AsNoTracking()
                    .Where(d => d.UniversityId == universityId)
                    .OrderBy(d => d.Name)
                    .ToListAsync();

                var deptDtos = departments.Select(d => new DepartmentDTO
                {
                    Id = d.Id,
                    Name = d.Name,
                    Code = d.Code,
                    UniversityId = d.UniversityId,
                    UniversityName = _context.Universities.Where(u => u.Id == d.UniversityId).Select(u => u.Name).FirstOrDefault() ?? string.Empty,
                    Description = d.Description,
                    BannerUrl = d.BannerUrl,
                    ThumbnailUrl = d.ThumbnailUrl,
                    HeadOfDepartment = d.HeadOfDepartment,
                    ContactEmail = d.ContactEmail,
                    ContactPhone = d.ContactPhone,
                    DepartmentType = d.DepartmentType,
                    TotalCourses = d.TotalCourses,
                    TotalStudents = d.TotalStudents,
                    TotalTeachers = d.TotalTeachers,
                    AverageCourseRating = d.AverageCourseRating,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt
                }).ToList();

                return ServiceResult<List<DepartmentDTO>>.SuccessResult(deptDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<DepartmentDTO>>.FailureResult($"Error fetching departments: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<DepartmentDTO>>> GetAllDepartments(int page, int pageSize)
        {
            try
            {
                var departments = await _context.Departments
                    .AsNoTracking()
                    .OrderBy(d => d.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var deptDtos = departments.Select(d => new DepartmentDTO
                {
                    Id = d.Id,
                    Name = d.Name,
                    Code = d.Code,
                    UniversityId = d.UniversityId,
                    UniversityName = _context.Universities.Where(u => u.Id == d.UniversityId).Select(u => u.Name).FirstOrDefault() ?? string.Empty,
                    Description = d.Description,
                    BannerUrl = d.BannerUrl,
                    ThumbnailUrl = d.ThumbnailUrl,
                    HeadOfDepartment = d.HeadOfDepartment,
                    ContactEmail = d.ContactEmail,
                    ContactPhone = d.ContactPhone,
                    DepartmentType = d.DepartmentType,
                    TotalCourses = d.TotalCourses,
                    TotalStudents = d.TotalStudents,
                    TotalTeachers = d.TotalTeachers,
                    AverageCourseRating = d.AverageCourseRating,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt
                }).ToList();

                return ServiceResult<List<DepartmentDTO>>.SuccessResult(deptDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<DepartmentDTO>>.FailureResult($"Error fetching departments: {ex.Message}");
            }
        }

        public Task<ServiceResult<DepartmentDTO>> UpdateDepartment(int departmentId, int universityId, UpdateDepartmentDTO dto)
            => Task.FromResult(ServiceResult<DepartmentDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> DeleteDepartment(int departmentId, int userId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<DepartmentDTO>>> SearchDepartments(string query, int? universityId)
            => Task.FromResult(ServiceResult<List<DepartmentDTO>>.FailureResult("Not implemented"));

        public async Task<ServiceResult<List<CourseDTO>>> GetDepartmentCourses(int departmentId, int page, int pageSize)
        {
            try
            {
                var query = _context.Courses
                    .AsNoTracking()
                    .Where(c => c.DepartmentId == departmentId && (c.Status == "Approved" || c.Status == "Published"))
                    .OrderByDescending(c => c.CreatedAt);

                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
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

                return ServiceResult<List<CourseDTO>>.SuccessResult(items);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CourseDTO>>.FailureResult($"Failed to get department courses: {ex.Message}");
            }
        }

        public Task<ServiceResult<DepartmentStatsDTO>> GetDepartmentStats(int departmentId)
            => Task.FromResult(ServiceResult<DepartmentStatsDTO>.FailureResult("Not implemented"));
    }
}
