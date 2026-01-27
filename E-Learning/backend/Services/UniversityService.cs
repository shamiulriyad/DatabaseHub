using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UniversityService : IUniversityService
    {
        private readonly ApplicationDbContext _context;

        public UniversityService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<UniversityDTO>> CreateUniversity(CreateUniversityDTO dto)
        {
            try
            {
                var university = new Models.University
                {
                    Name = dto.Name,
                    Code = dto.Code,
                    Description = dto.Description,
                    LogoUrl = dto.LogoUrl,
                    BannerUrl = dto.BannerUrl,
                    Website = dto.Website,
                    Location = dto.Location,
                    EstablishedYear = dto.EstablishedYear,
                    ContactEmail = dto.ContactEmail,
                    ContactPhone = dto.ContactPhone,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Universities.Add(university);
                await _context.SaveChangesAsync();

                // Note: Previously we seeded a set of default departments here.
                // Removed automatic seeding so newly created universities start with no departments.

                var universityDto = MapToDTO(university);
                return ServiceResult<UniversityDTO>.SuccessResult(universityDto, "University created successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<UniversityDTO>.FailureResult($"Error creating university: {ex.Message}");
            }
        }

        public async Task<ServiceResult<UniversityDTO>> GetUniversityById(int universityId, int? callerUserId = null)
        {
            try
            {
                var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == universityId);
                
                if (university == null)
                    return ServiceResult<UniversityDTO>.FailureResult("University not found");

                var universityDto = MapToDTO(university);

                // allow editing by all users
                universityDto.CanEdit = true;

                return ServiceResult<UniversityDTO>.SuccessResult(universityDto);
            }
            catch (Exception ex)
            {
                return ServiceResult<UniversityDTO>.FailureResult($"Error fetching university: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<UniversityDTO>>> GetAllUniversities(int page, int pageSize, int? callerUserId = null)
        {
            try
            {
                var universities = await _context.Universities
                    .AsNoTracking()
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Determine which universities the caller can edit (if caller provided)
                bool isAdmin = false;
                HashSet<int> editableUniversityIds = new HashSet<int>();
                if (callerUserId.HasValue)
                {
                    var caller = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == callerUserId.Value);
                    if (caller != null)
                    {
                        isAdmin = caller.IsAdmin;
                        if (!isAdmin)
                        {
                            var ids = await _context.Enrollments
                                .AsNoTracking()
                                .Where(e => e.UserId == callerUserId.Value && e.Course.UniversityId != null)
                                .Select(e => e.Course.UniversityId)
                                .Distinct()
                                .ToListAsync();
                            foreach (var id in ids) editableUniversityIds.Add(id);
                        }
                    }
                }

                var universityDtos = universities.Select(u => {
                    var dto = MapToDTO(u);
                    // expose edit capability to all users
                    dto.CanEdit = true;
                    return dto;
                }).ToList();

                return ServiceResult<List<UniversityDTO>>.SuccessResult(universityDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<UniversityDTO>>.FailureResult($"Error fetching universities: {ex.Message}");
            }
        }

        public async Task<ServiceResult<UniversityDTO>> UpdateUniversity(int universityId, UpdateUniversityDTO dto, int? callerUserId = null)
        {
            try
            {
                var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == universityId);
                
                if (university == null)
                    return ServiceResult<UniversityDTO>.FailureResult("University not found");

                // Editing allowed for all authenticated users only
                if (!callerUserId.HasValue)
                    return ServiceResult<UniversityDTO>.FailureResult("Unauthorized");

                if (!string.IsNullOrEmpty(dto.Name))
                    university.Name = dto.Name;
                if (!string.IsNullOrEmpty(dto.Description))
                    university.Description = dto.Description;
                if (!string.IsNullOrEmpty(dto.LogoUrl))
                    university.LogoUrl = dto.LogoUrl;
                if (!string.IsNullOrEmpty(dto.BannerUrl))
                    university.BannerUrl = dto.BannerUrl;
                if (!string.IsNullOrEmpty(dto.Website))
                    university.Website = dto.Website;
                if (!string.IsNullOrEmpty(dto.Location))
                    university.Location = dto.Location;
                if (!string.IsNullOrEmpty(dto.ContactEmail))
                    university.ContactEmail = dto.ContactEmail;
                if (!string.IsNullOrEmpty(dto.ContactPhone))
                    university.ContactPhone = dto.ContactPhone;
                if (dto.IsActive.HasValue)
                    university.IsActive = dto.IsActive.Value;

                _context.Universities.Update(university);
                await _context.SaveChangesAsync();

                var universityDto = MapToDTO(university);
                // Maintain CanEdit: caller can edit (we already checked)
                universityDto.CanEdit = true;
                return ServiceResult<UniversityDTO>.SuccessResult(universityDto, "University updated successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<UniversityDTO>.FailureResult($"Error updating university: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> DeleteUniversity(int universityId)
        {
            try
            {
                var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == universityId);
                
                if (university == null)
                    return ServiceResult<bool>.FailureResult("University not found");

                _context.Universities.Remove(university);
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true, "University deleted successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Error deleting university: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<CourseDTO>>> GetUniversityCourses(int universityId, int page, int pageSize)
        {
            try
            {
                var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == universityId);
                
                if (university == null)
                    return ServiceResult<List<CourseDTO>>.FailureResult("University not found");

                var courses = await _context.Courses
                    .AsNoTracking()
                    .Where(c => c.UniversityId == universityId)
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var courseDtos = courses.Select(c => new CourseDTO
                {
                    Id = c.Id,
                    Title = c.Title,
                    ShortDescription = c.ShortDescription,
                    DifficultyLevel = c.DifficultyLevel,
                    IsFree = c.IsFree,
                    Price = c.Price,
                    ThumbnailUrl = c.ThumbnailUrl,
                    Status = c.Status,
                    AverageRating = c.AverageRating,
                    CreatedAt = c.CreatedAt
                }).ToList();

                return ServiceResult<List<CourseDTO>>.SuccessResult(courseDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CourseDTO>>.FailureResult($"Error fetching courses: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<TeacherDTO>>> GetUniversityTeachers(int universityId, int page, int pageSize)
        {
            try
            {
                var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == universityId);
                
                if (university == null)
                    return ServiceResult<List<TeacherDTO>>.FailureResult("University not found");

                var teachers = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.IsTeacher && u.Enrollments.Any(e => e.Course.UniversityId == universityId))
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var teacherDtos = teachers.Select(t => new TeacherDTO
                {
                    Id = t.Id,
                    Name = $"{t.FirstName} {t.LastName}",
                    ProfileImageUrl = t.ProfileImageUrl,
                    Bio = t.Bio,
                    Specialization = t.Bio,
                    AverageRating = (decimal)(t.TotalPoints > 0 ? t.TotalPoints / 10.0 : 0),
                    TotalStudents = t.TotalCoursesEnrolled,
                    TotalCourses = t.CreatedCourses.Count,
                    IsVerified = t.IsTeacher
                }).ToList();

                return ServiceResult<List<TeacherDTO>>.SuccessResult(teacherDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<TeacherDTO>>.FailureResult($"Error fetching teachers: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<StudentDTO>>> GetUniversityStudents(int universityId, int page, int pageSize)
        {
            try
            {
                var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == universityId);
                
                if (university == null)
                    return ServiceResult<List<StudentDTO>>.FailureResult("University not found");

                var students = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.IsStudent && u.Enrollments.Any(e => e.Course.UniversityId == universityId))
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var studentDtos = students.Select(s => new StudentDTO
                {
                    Id = s.Id,
                    Username = s.Username,
                    Email = s.Email,
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    ProfileImageUrl = s.ProfileImageUrl,
                    Bio = s.Bio,
                    CreatedAt = s.CreatedAt,
                    IsStudent = s.IsStudent,
                    IsTeacher = s.IsTeacher,
                    IsCompetitor = s.IsCompetitor,
                    IsAdmin = s.IsAdmin,
                    TotalPoints = s.TotalPoints,
                    CurrentRank = s.CurrentRank,
                    TotalCoursesEnrolled = s.TotalCoursesEnrolled,
                    TotalCoursesCompleted = s.TotalCoursesCompleted,
                    AverageGrade = s.AverageGrade,
                    LastLogin = s.LastLogin
                }).ToList();

                return ServiceResult<List<StudentDTO>>.SuccessResult(studentDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<StudentDTO>>.FailureResult($"Error fetching students: {ex.Message}");
            }
        }

        public async Task<ServiceResult<UniversityDetailDTO>> GetUniversityDetails(int universityId, int? callerUserId = null)
        {
            try
            {
                var university = await _context.Universities
                    .Include(u => u.Departments)
                    .Include(u => u.Courses)
                    .FirstOrDefaultAsync(u => u.Id == universityId);
                
                if (university == null)
                    return ServiceResult<UniversityDetailDTO>.FailureResult("University not found");

                var departments = university.Departments.Select(d => new DepartmentDTO
                {
                    Id = d.Id,
                    Name = d.Name,
                    Code = d.Code,
                    Description = d.Description,
                    CreatedAt = d.CreatedAt
                }).ToList();

                var topCourses = university.Courses
                    .OrderByDescending(c => c.AverageRating)
                    .Take(5)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        ShortDescription = c.ShortDescription,
                        DifficultyLevel = c.DifficultyLevel,
                        IsFree = c.IsFree,
                        Price = c.Price,
                        AverageRating = c.AverageRating,
                        CreatedAt = c.CreatedAt
                    }).ToList();

                var topTeachers = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.IsTeacher && u.CreatedCourses.Any(c => c.UniversityId == universityId))
                    .OrderByDescending(u => u.TotalPoints)
                    .Take(5)
                    .Select(t => new TeacherDTO
                    {
                        Id = t.Id,
                        Name = $"{t.FirstName} {t.LastName}",
                        ProfileImageUrl = t.ProfileImageUrl,
                        Bio = t.Bio,
                        Specialization = t.Bio,
                        AverageRating = (decimal)(t.TotalPoints > 0 ? t.TotalPoints / 10.0 : 0),
                        TotalStudents = t.TotalCoursesEnrolled,
                        TotalCourses = t.CreatedCourses.Count,
                        IsVerified = t.IsTeacher
                    }).ToListAsync();

                var stats = await GetUniversityStats(universityId);

                var detailDTO = new UniversityDetailDTO
                {
                    Id = university.Id,
                    Name = university.Name,
                    Code = university.Code,
                    Description = university.Description,
                    LogoUrl = university.LogoUrl,
                    BannerUrl = university.BannerUrl,
                    Website = university.Website,
                    Location = university.Location,
                    EstablishedYear = university.EstablishedYear,
                    TotalCourses = university.TotalCourses,
                    TotalStudents = university.TotalStudents,
                    TotalTeachers = university.TotalTeachers,
                    TotalEnrollments = university.TotalEnrollments,
                    UniversityRank = university.UniversityRank,
                    AverageCourseRating = university.AverageCourseRating,
                    IsActive = university.IsActive,
                    IsVerified = university.IsVerified,
                    CreatedAt = university.CreatedAt,
                    Departments = departments,
                    PopularCourses = topCourses,
                    TopTeachers = topTeachers,
                    Stats = stats.Data
                };

                // expose edit capability to all users
                detailDTO.CanEdit = true;

                return ServiceResult<UniversityDetailDTO>.SuccessResult(detailDTO);
            }
            catch (Exception ex)
            {
                return ServiceResult<UniversityDetailDTO>.FailureResult($"Error fetching university details: {ex.Message}");
            }
        }

        public async Task<ServiceResult<UniversityStatsDTO>> GetUniversityStats(int universityId)
        {
            try
            {
                var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == universityId);
                
                if (university == null)
                    return ServiceResult<UniversityStatsDTO>.FailureResult("University not found");

                var totalDepartments = await _context.Departments.CountAsync(d => d.UniversityId == universityId);
                var totalCourses = await _context.Courses.CountAsync(c => c.UniversityId == universityId);
                var totalEnrollments = await _context.Enrollments.CountAsync(e => e.Course.UniversityId == universityId);
                var totalStudents = await _context.Users.CountAsync(u => u.IsStudent && u.Enrollments.Any(e => e.Course.UniversityId == universityId));
                var totalTeachers = await _context.Users.CountAsync(u => u.IsTeacher && u.CreatedCourses.Any(c => c.UniversityId == universityId));
                var averageRating = await _context.Courses
                    .Where(c => c.UniversityId == universityId)
                    .AverageAsync(c => c.AverageRating);

                var activeCompetitions = await _context.Competitions.CountAsync(c => c.UniversityId == universityId && c.Status == "Active");
                var activeClans = await _context.Clans.CountAsync(c => c.UniversityId == universityId && c.IsPublic);

                var departmentDistribution = await _context.Departments
                    .AsNoTracking()
                    .Where(d => d.UniversityId == universityId)
                    .Select(d => new { d.Name, Count = d.Courses.Count })
                    .ToListAsync();

                var stats = new UniversityStatsDTO
                {
                    TotalDepartments = totalDepartments,
                    TotalCourses = totalCourses,
                    TotalEnrollments = totalEnrollments,
                    TotalStudents = totalStudents,
                    TotalTeachers = totalTeachers,
                    AverageRating = (decimal)averageRating,
                    ActiveCompetitions = activeCompetitions,
                    ActiveClans = activeClans,
                    DepartmentDistribution = departmentDistribution.ToDictionary(d => d.Name, d => d.Count)
                };

                return ServiceResult<UniversityStatsDTO>.SuccessResult(stats);
            }
            catch (Exception ex)
            {
                return ServiceResult<UniversityStatsDTO>.FailureResult($"Error fetching university stats: {ex.Message}");
            }
        }

        private UniversityDTO MapToDTO(Models.University university)
        {
            return new UniversityDTO
            {
                Id = university.Id,
                Name = university.Name,
                Code = university.Code,
                Description = university.Description,
                LogoUrl = university.LogoUrl,
                BannerUrl = university.BannerUrl,
                Website = university.Website,
                Location = university.Location,
                EstablishedYear = university.EstablishedYear,
                TotalCourses = university.TotalCourses,
                TotalStudents = university.TotalStudents,
                TotalTeachers = university.TotalTeachers,
                TotalEnrollments = university.TotalEnrollments,
                UniversityRank = university.UniversityRank,
                AverageCourseRating = university.AverageCourseRating,
                IsActive = university.IsActive,
                IsVerified = university.IsVerified,
                CreatedAt = university.CreatedAt
            };
        }
    }
}
