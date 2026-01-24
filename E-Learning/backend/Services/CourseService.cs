using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Collections.Generic;
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

        public async Task<ServiceResult<PaginatedResponse<CourseDTO>>> GetAllCourses(string? search, int? universityId, int? departmentId, string? difficulty, bool? isFree, string? status, string? sortBy, int page, int pageSize)
        {
            try
            {
                var query = _context.Courses.AsNoTracking().AsQueryable();

                // Default to only published/approved courses for public listing
                if (!string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(c => c.Status == status || c.Status == "Published" || c.Status == "Approved");
                }

                if (universityId.HasValue) query = query.Where(c => c.UniversityId == universityId.Value);
                if (departmentId.HasValue) query = query.Where(c => c.DepartmentId == departmentId.Value);
                if (!string.IsNullOrWhiteSpace(difficulty)) query = query.Where(c => c.DifficultyLevel == difficulty);
                if (isFree.HasValue) query = query.Where(c => c.IsFree == isFree.Value);
                if (!string.IsNullOrWhiteSpace(search)) query = query.Where(c => EF.Functions.ILike(c.Title, $"%{search}%") || EF.Functions.ILike(c.ShortDescription, $"%{search}%"));

                // Sorting
                query = sortBy switch
                {
                    "popular" => query.OrderByDescending(c => c.EnrollmentCount),
                    "rating" => query.OrderByDescending(c => c.AverageRating),
                    _ => query.OrderByDescending(c => c.CreatedAt),
                };

                var total = await query.CountAsync();
                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        FullDescription = c.FullDescription,
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

                var paged = new PaginatedResponse<CourseDTO>
                {
                    Items = items,
                    TotalCount = total,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)total / pageSize),
                    HasPreviousPage = page > 1,
                    HasNextPage = page * pageSize < total
                };

                return ServiceResult<PaginatedResponse<CourseDTO>>.SuccessResult(paged);
            }
            catch (Exception ex)
            {
                return ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult($"Failed to get courses: {ex.Message}");
            }
        }

        public async Task<ServiceResult<CourseDetailDTO>> GetCourseById(int id, int? userId)
        {
            try
            {
                var c = await _context.Courses
                    .AsNoTracking()
                    .Where(x => x.Id == id)
                    .Select(x => new CourseDetailDTO
                    {
                        Id = x.Id,
                        Title = x.Title,
                        ShortDescription = x.ShortDescription,
                        FullDescription = x.FullDescription,
                        ThumbnailUrl = x.ThumbnailUrl,
                        PreviewVideoUrl = x.PreviewVideoUrl,
                        VideoParts = x.CourseParts
                            .OrderBy(p => p.Order)
                            .Select(p => new DTOs.CoursePartDTO
                            {
                                Id = p.Id,
                                Title = p.Title,
                                Description = p.Description,
                                VideoUrl = p.VideoUrl,
                                YouTubeUrl = p.YouTubeUrl,
                                Order = p.Order,
                                IsPreview = p.IsPreview
                            }).ToList(),
                        UniversityId = x.UniversityId,
                        University = new UniversityDTO { Id = x.University.Id, Name = x.University.Name, BannerUrl = x.University.BannerUrl },
                        UniversityName = x.University.Name,
                        DepartmentId = x.DepartmentId,
                        Department = new DepartmentDTO { Id = x.Department.Id, Name = x.Department.Name },
                        DepartmentName = x.Department.Name,
                        TeacherId = x.TeacherId,
                        Teacher = new TeacherDTO { Id = x.Teacher.Id, Name = (x.Teacher.FirstName + " " + x.Teacher.LastName).Trim(), ProfileImageUrl = x.Teacher.ProfileImageUrl },
                        TeacherName = (x.Teacher.FirstName + " " + x.Teacher.LastName).Trim(),
                        CourseCode = x.CourseCode,
                        CourseType = x.CourseType,
                        IsFree = x.IsFree,
                        Price = x.Price,
                        DiscountPrice = x.DiscountPrice,
                        DurationHours = x.DurationHours,
                        DifficultyLevel = x.DifficultyLevel,
                        EnrollmentCount = x.EnrollmentCount,
                        AverageRating = x.AverageRating,
                        TotalReviews = x.TotalReviews,
                        Status = x.Status,
                        CreatedAt = x.CreatedAt,
                        PublishedAt = x.PublishedAt,
                        Modules = new List<ModuleDTO>(),
                        Reviews = new List<ReviewDTO>(),
                        FAQs = new List<FAQDTO>(),
                        Tags = new List<string>(),
                        Prerequisites = new List<string>(),
                        LearningOutcomes = new List<string>(),
                        TargetAudience = new List<string>(),
                        IsTeacher = userId.HasValue && userId.Value == x.TeacherId,
                        CanEdit = userId.HasValue && (userId.Value == x.TeacherId)
                    })
                    .FirstOrDefaultAsync();

                if (c == null) return ServiceResult<CourseDetailDTO>.FailureResult("Course not found");

                // Determine enrollment for the requesting user (if any)
                if (userId.HasValue)
                {
                    var enrolled = await _context.Enrollments
                        .AsNoTracking()
                        .AnyAsync(e => e.CourseId == id && e.UserId == userId.Value);
                    c.IsEnrolled = enrolled;
                }

                return ServiceResult<CourseDetailDTO>.SuccessResult(c);
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDetailDTO>.FailureResult($"Failed to get course details: {ex.Message}");
            }
        }

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
                                FullDescription = c.FullDescription,
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
                                FullDescription = c.FullDescription,
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
                        FullDescription = c.FullDescription,
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

        public async Task<ServiceResult<PaginatedResponse<CourseDTO>>> GetCoursesByTeacher(int teacherId, int page, int pageSize)
        {
            try
            {
                var query = _context.Courses
                    .AsNoTracking()
                    .Where(c => c.TeacherId == teacherId)
                    .OrderByDescending(c => c.CreatedAt);

                var total = await query.CountAsync();
                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        FullDescription = c.FullDescription,
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

                var paged = new PaginatedResponse<CourseDTO>
                {
                    Items = items,
                    TotalCount = total,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)total / pageSize),
                    HasPreviousPage = page > 1,
                    HasNextPage = page * pageSize < total
                };

                return ServiceResult<PaginatedResponse<CourseDTO>>.SuccessResult(paged);
            }
            catch (Exception ex)
            {
                return ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult($"Failed to get teacher courses: {ex.Message}");
            }
        }

        public async Task<ServiceResult<CourseDTO>> CreateCourse(CourseCreateDTO dto, int teacherId)
        {
            try
            {
                // Validate university and department
                var uni = await _context.Universities.FindAsync(dto.UniversityId);
                if (uni == null) return ServiceResult<CourseDTO>.FailureResult("University not found");

                var dept = await _context.Departments.FindAsync(dto.DepartmentId);
                if (dept == null || dept.UniversityId != dto.UniversityId) return ServiceResult<CourseDTO>.FailureResult("Department not found or does not belong to the university");

                var course = new Models.Course
                {
                    Title = dto.Title,
                    ShortDescription = dto.ShortDescription,
                    FullDescription = dto.FullDescription,
                    UniversityId = dto.UniversityId,
                    DepartmentId = dto.DepartmentId,
                    TeacherId = teacherId,
                    CourseCode = dto.CourseCode,
                    CourseType = dto.CourseType,
                    ExamFocus = dto.ExamFocus,
                    ExamPattern = dto.ExamPattern,
                    ImportantTopics = dto.ImportantTopics,
                    PreviousQuestions = dto.PreviousQuestions,
                    IsFree = dto.IsFree,
                    Price = dto.Price,
                    DiscountPrice = dto.DiscountPrice,
                    DurationHours = dto.DurationHours,
                    DifficultyLevel = dto.DifficultyLevel,
                    ThumbnailUrl = dto.ThumbnailUrl,
                    PreviewVideoUrl = dto.PreviewVideoUrl,
                    CourseMaterials = dto.CourseMaterials,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    IsSelfPaced = dto.IsSelfPaced,
                    Tags = dto.Tags,
                    Keywords = dto.Keywords,
                    CreatedAt = DateTime.UtcNow,
                    Status = "Pending"
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                // Persist video parts if any
                if (dto.VideoParts != null && dto.VideoParts.Any())
                {
                    var parts = dto.VideoParts.Select((p, idx) => new Models.CoursePart
                    {
                        CourseId = course.Id,
                        Title = p.Title,
                        Description = p.Description,
                        VideoUrl = p.VideoUrl,
                        YouTubeUrl = p.YouTubeUrl,
                        Order = p.Order != 0 ? p.Order : idx + 1,
                        IsPreview = p.IsPreview
                    }).ToList();

                    _context.AddRange(parts);
                    await _context.SaveChangesAsync();
                }
                var resultDto = new CourseDTO
                {
                    Id = course.Id,
                    FullDescription = course.FullDescription,
                    Title = course.Title,
                    ShortDescription = course.ShortDescription,
                    ThumbnailUrl = course.ThumbnailUrl,
                    UniversityId = course.UniversityId,
                    UniversityName = uni.Name,
                    DepartmentId = course.DepartmentId,
                    DepartmentName = dept.Name,
                    TeacherId = course.TeacherId,
                    TeacherName = (course.Teacher?.FirstName + " " + course.Teacher?.LastName).Trim(),
                    CourseCode = course.CourseCode,
                    CourseType = course.CourseType,
                    IsFree = course.IsFree,
                    Price = course.Price,
                    DiscountPrice = course.DiscountPrice,
                    DurationHours = course.DurationHours,
                    DifficultyLevel = course.DifficultyLevel,
                    EnrollmentCount = course.EnrollmentCount,
                    AverageRating = course.AverageRating,
                    TotalReviews = course.TotalReviews,
                    Status = course.Status,
                    CreatedAt = course.CreatedAt,
                    PublishedAt = course.PublishedAt,
                    IsEnrolled = false,
                    ProgressPercentage = null
                };

                return ServiceResult<CourseDTO>.SuccessResult(resultDto);
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDTO>.FailureResult($"Failed to create course: {ex.Message}");
            }
        }

        public async Task<ServiceResult<CourseDTO>> UpdateCourse(int id, int userId, string userRole, CourseUpdateDTO dto)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null) return ServiceResult<CourseDTO>.FailureResult("Course not found");

                if (userRole != "Admin" && course.TeacherId != userId)
                    return ServiceResult<CourseDTO>.FailureResult("Unauthorized to edit this course");

                // Apply updates (only provided fields)
                if (!string.IsNullOrWhiteSpace(dto.Title)) course.Title = dto.Title;
                if (!string.IsNullOrWhiteSpace(dto.ShortDescription)) course.ShortDescription = dto.ShortDescription;
                if (!string.IsNullOrWhiteSpace(dto.FullDescription)) course.FullDescription = dto.FullDescription;
                if (dto.IsFree.HasValue) course.IsFree = dto.IsFree.Value;
                if (dto.Price.HasValue) course.Price = dto.Price;
                if (dto.DiscountPrice.HasValue) course.DiscountPrice = dto.DiscountPrice;
                if (!string.IsNullOrWhiteSpace(dto.DifficultyLevel)) course.DifficultyLevel = dto.DifficultyLevel;
                if (!string.IsNullOrWhiteSpace(dto.ThumbnailUrl)) course.ThumbnailUrl = dto.ThumbnailUrl;
                if (!string.IsNullOrWhiteSpace(dto.PreviewVideoUrl)) course.PreviewVideoUrl = dto.PreviewVideoUrl;
                if (!string.IsNullOrWhiteSpace(dto.Status) && userRole == "Admin") course.Status = dto.Status;
                if (dto.StartDate.HasValue) course.StartDate = dto.StartDate;
                if (dto.EndDate.HasValue) course.EndDate = dto.EndDate;
                if (dto.IsSelfPaced.HasValue) course.IsSelfPaced = dto.IsSelfPaced.Value;
                if (!string.IsNullOrWhiteSpace(dto.Tags)) course.Tags = dto.Tags;

                course.UpdatedAt = DateTime.UtcNow;

                _context.Courses.Update(course);
                await _context.SaveChangesAsync();

                // Replace video parts if provided (simple replace strategy)
                if (dto.VideoParts != null)
                {
                    var existing = _context.Set<Models.CoursePart>().Where(p => p.CourseId == course.Id).ToList();
                    if (existing.Any())
                    {
                        _context.Set<Models.CoursePart>().RemoveRange(existing);
                        await _context.SaveChangesAsync();
                    }

                    var newParts = dto.VideoParts.Select((p, idx) => new Models.CoursePart
                    {
                        CourseId = course.Id,
                        Title = p.Title,
                        Description = p.Description,
                        VideoUrl = p.VideoUrl,
                        YouTubeUrl = p.YouTubeUrl,
                        Order = p.Order != 0 ? p.Order : idx + 1,
                        IsPreview = p.IsPreview
                    }).ToList();

                    if (newParts.Any())
                    {
                        _context.Set<Models.CoursePart>().AddRange(newParts);
                        await _context.SaveChangesAsync();
                    }
                }

                // Return basic DTO
                var updated = await _context.Courses
                    .AsNoTracking()
                    .Where(c => c.Id == id)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        FullDescription = c.FullDescription,
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
                    .FirstOrDefaultAsync();

                return ServiceResult<CourseDTO>.SuccessResult(updated);
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDTO>.FailureResult($"Failed to update course: {ex.Message}");
            }
        }

        public async Task<ServiceResult<CourseDTO>> UpdateCourseStatus(int id, int adminId, UpdateCourseStatusDTO dto)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null) return ServiceResult<CourseDTO>.FailureResult("Course not found");

                // Admin action
                var status = dto.Status?.Trim();
                if (string.IsNullOrWhiteSpace(status)) return ServiceResult<CourseDTO>.FailureResult("Status is required");

                if (status.Equals("Approve", StringComparison.OrdinalIgnoreCase) || status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
                {
                    course.Status = "Published";
                    course.ApprovedBy = adminId;
                    course.ApprovedAt = DateTime.UtcNow;
                    course.PublishedAt = DateTime.UtcNow;
                }
                else if (status.Equals("Reject", StringComparison.OrdinalIgnoreCase) || status.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
                {
                    course.Status = "Rejected";
                    course.RejectionReason = dto.Reason;
                }
                else if (status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                {
                    course.Status = "Pending";
                }
                else if (status.Equals("Publish", StringComparison.OrdinalIgnoreCase) || status.Equals("Published", StringComparison.OrdinalIgnoreCase))
                {
                    course.Status = "Published";
                    course.PublishedAt = DateTime.UtcNow;
                }
                else
                {
                    course.Status = dto.Status;
                }

                _context.Courses.Update(course);
                await _context.SaveChangesAsync();

                var updated = await _context.Courses
                    .AsNoTracking()
                    .Where(c => c.Id == id)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        FullDescription = c.FullDescription,
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
                    .FirstOrDefaultAsync();

                return ServiceResult<CourseDTO>.SuccessResult(updated);
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDTO>.FailureResult($"Failed to update course status: {ex.Message}");
            }
        }

        public async Task<ServiceResult<EnrollmentDTO>> EnrollInCourse(int userId, int courseId)
        {
            try
            {
                var course = await _context.Courses.FindAsync(courseId);
                if (course == null) return ServiceResult<EnrollmentDTO>.FailureResult("Course not found");

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return ServiceResult<EnrollmentDTO>.FailureResult("User not found");

                // Check existing enrollment
                var existing = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);
                if (existing != null)
                {
                    var existingDto = new EnrollmentDTO
                    {
                        Id = existing.Id,
                        UserId = existing.UserId,
                        CourseId = existing.CourseId,
                        CourseTitle = course.Title,
                        CourseThumbnail = course.ThumbnailUrl,
                        EnrollmentType = existing.EnrollmentType,
                        EnrolledAt = existing.EnrolledAt,
                        CompletedAt = existing.CompletedAt,
                        LastAccessed = existing.LastAccessed,
                        ExpiryDate = existing.ExpiryDate,
                        CompletedLessons = existing.CompletedLessons,
                        TotalLessons = existing.TotalLessons,
                        CompletedModules = existing.CompletedModules,
                        TotalModules = existing.TotalModules,
                        ProgressPercentage = existing.ProgressPercentage,
                        QuizAverage = existing.QuizAverage,
                        AssignmentAverage = existing.AssignmentAverage,
                        FinalGrade = existing.FinalGrade,
                        GradeLetter = existing.GradeLetter,
                        PointsEarned = existing.PointsEarned,
                        Status = existing.Status,
                        AmountPaid = existing.AmountPaid,
                        PaymentStatus = existing.PaymentStatus,
                        CertificateEarned = existing.CertificateEarned,
                        CertificateUrl = existing.CertificateUrl
                    };

                    return ServiceResult<EnrollmentDTO>.SuccessResult(existingDto);
                }

                var enrollment = new Models.Enrollment
                {
                    UserId = userId,
                    CourseId = courseId,
                    EnrollmentType = "Student",
                    EnrolledAt = DateTime.UtcNow,
                    Status = "Active",
                    ProgressPercentage = 0
                };

                _context.Enrollments.Add(enrollment);
                course.EnrollmentCount += 1;
                _context.Courses.Update(course);

                await _context.SaveChangesAsync();

                var dto = new EnrollmentDTO
                {
                    Id = enrollment.Id,
                    UserId = enrollment.UserId,
                    CourseId = enrollment.CourseId,
                    CourseTitle = course.Title,
                    CourseThumbnail = course.ThumbnailUrl,
                    EnrollmentType = enrollment.EnrollmentType,
                    EnrolledAt = enrollment.EnrolledAt,
                    CompletedAt = enrollment.CompletedAt,
                    LastAccessed = enrollment.LastAccessed,
                    ExpiryDate = enrollment.ExpiryDate,
                    CompletedLessons = enrollment.CompletedLessons,
                    TotalLessons = enrollment.TotalLessons,
                    CompletedModules = enrollment.CompletedModules,
                    TotalModules = enrollment.TotalModules,
                    ProgressPercentage = enrollment.ProgressPercentage,
                    QuizAverage = enrollment.QuizAverage,
                    AssignmentAverage = enrollment.AssignmentAverage,
                    FinalGrade = enrollment.FinalGrade,
                    GradeLetter = enrollment.GradeLetter,
                    PointsEarned = enrollment.PointsEarned,
                    Status = enrollment.Status,
                    AmountPaid = enrollment.AmountPaid,
                    PaymentStatus = enrollment.PaymentStatus,
                    CertificateEarned = enrollment.CertificateEarned,
                    CertificateUrl = enrollment.CertificateUrl
                };

                return ServiceResult<EnrollmentDTO>.SuccessResult(dto);
            }
            catch (Exception ex)
            {
                return ServiceResult<EnrollmentDTO>.FailureResult($"Failed to enroll: {ex.Message}");
            }
        }

        public Task<ServiceResult<PaginatedResponse<EnrollmentDTO>>> GetUserEnrolledCourses(int userId, string? status, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<EnrollmentDTO>>.FailureResult("Not implemented"));

        public async Task<ServiceResult<PaginatedResponse<CourseDTO>>> GetUserCreatedCourses(int userId, string? status, int page, int pageSize)
        {
            try
            {
                var query = _context.Courses.AsNoTracking().Where(c => c.TeacherId == userId);
                if (!string.IsNullOrWhiteSpace(status) && status != "All")
                    query = query.Where(c => c.Status == status);

                var total = await query.CountAsync();
                var items = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        FullDescription = c.FullDescription,
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

                var paged = new PaginatedResponse<CourseDTO>
                {
                    Items = items,
                    TotalCount = total,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)total / pageSize),
                    HasPreviousPage = page > 1,
                    HasNextPage = page * pageSize < total
                };

                return ServiceResult<PaginatedResponse<CourseDTO>>.SuccessResult(paged);
            }
            catch (Exception ex)
            {
                return ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult($"Failed to get user created courses: {ex.Message}");
            }
        }

        public Task<ServiceResult<List<ModuleDTO>>> GetCourseModules(int courseId)
            => Task.FromResult(ServiceResult<List<ModuleDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<ReviewDTO>>> GetCourseReviews(int courseId, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<ReviewDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<CourseDTO>>> SearchCourses(string query, int? universityId, int? departmentId, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<PaginatedResponse<CourseDTO>>> FilterCourses(CourseFilterDTO filter, int page, int pageSize)
            => Task.FromResult(ServiceResult<PaginatedResponse<CourseDTO>>.FailureResult("Not implemented"));

        public async Task<ServiceResult<bool>> DeleteCourse(int id, int userId, string userRole)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null) return ServiceResult<bool>.FailureResult("Course not found");

                if (userRole != "Admin" && course.TeacherId != userId)
                    return ServiceResult<bool>.FailureResult("Unauthorized to delete this course");

                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to delete course: {ex.Message}");
            }
        }

        public Task<ServiceResult<CourseStatsDTO>> GetCourseStats(int courseId)
            => Task.FromResult(ServiceResult<CourseStatsDTO>.FailureResult("Not implemented"));
    }
}
