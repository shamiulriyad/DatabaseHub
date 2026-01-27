using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;

        public AdminService(ApplicationDbContext context)
        {
            _context = context;
        }

        // TEACHER APPROVAL METHODS

        /// <summary>
        /// Get all users with pending teacher approvals
        /// </summary>
        public async Task<ServiceResult<List<UserDTO>>> GetPendingTeacherApprovals(int page = 1, int pageSize = 20)
        {
            try
            {
                var pendingTeachers = await _context.Users
                    .Where(u => u.TeacherPendingApproval)
                    .OrderByDescending(u => u.TeacherRequestDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var userDTOs = pendingTeachers.Select(MapUserToDTO).ToList();
                return ServiceResult<List<UserDTO>>.SuccessResult(
                    userDTOs,
                    $"Found {userDTOs.Count} pending teacher approvals"
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<List<UserDTO>>.FailureResult($"Failed to get pending teacher approvals: {ex.Message}");
            }
        }

        /// <summary>
        /// Get count of pending teacher approvals
        /// </summary>
        public async Task<ServiceResult<int>> GetPendingTeacherApprovalsCount()
        {
            try
            {
                var count = await _context.Users
                    .Where(u => u.TeacherPendingApproval)
                    .CountAsync();

                return ServiceResult<int>.SuccessResult(count, "Pending count retrieved");
            }
            catch (Exception ex)
            {
                return ServiceResult<int>.FailureResult($"Failed to get pending count: {ex.Message}");
            }
        }

        /// <summary>
        /// Approve a user's teacher request
        /// </summary>
        public async Task<ServiceResult<UserDTO>> ApproveTeacherRequest(int userId)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                
                if (user == null)
                    return ServiceResult<UserDTO>.FailureResult("User not found");

                if (!user.TeacherPendingApproval)
                    return ServiceResult<UserDTO>.FailureResult("This user does not have a pending teacher approval request");

                // Approve the request
                user.IsTeacher = true;
                user.TeacherPendingApproval = false;
                user.UpdatedAt = DateTime.UtcNow;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return ServiceResult<UserDTO>.SuccessResult(
                    MapUserToDTO(user),
                    "Teacher request approved successfully"
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<UserDTO>.FailureResult($"Failed to approve teacher request: {ex.Message}");
            }
        }

        /// <summary>
        /// Reject a user's teacher request
        /// </summary>
        public async Task<ServiceResult<bool>> RejectTeacherRequest(int userId, string reason = "")
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                
                if (user == null)
                    return ServiceResult<bool>.FailureResult("User not found");

                if (!user.TeacherPendingApproval)
                    return ServiceResult<bool>.FailureResult("This user does not have a pending teacher approval request");

                // Reset the pending approval flag
                user.TeacherPendingApproval = false;
                user.UpdatedAt = DateTime.UtcNow;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(
                    true,
                    "Teacher request rejected successfully"
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to reject teacher request: {ex.Message}");
            }
        }

        private UserDTO MapUserToDTO(User user)
        {
            return new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfileImageUrl = user.ProfileImageUrl,
                Bio = user.Bio,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                IsStudent = user.IsStudent,
                IsTeacher = user.IsTeacher,
                IsCompetitor = user.IsCompetitor,
                IsAdmin = user.IsAdmin,
                // TotalPoints removed
                CurrentRank = user.CurrentRank,
                TotalCoursesEnrolled = user.TotalCoursesEnrolled,
                TotalCoursesCompleted = user.TotalCoursesCompleted,
                // AverageGrade removed
                    // If the user submitted a teacher application, expose that timestamp
                    TeacherRequestDate = user.TeacherRequestDate,
                    CreatedAt = user.CreatedAt,
                    LastLogin = user.LastLogin
            };
        }

        public async Task<ServiceResult<PlatformStatsDTO>> GetPlatformStats()
        {
            try
            {
                // Get total users count
                var totalUsers = await _context.Users.CountAsync();
                
                // Get teachers count (approved teachers)
                var totalTeachers = await _context.Users.Where(u => u.IsTeacher).CountAsync();
                
                // Get students count
                var totalStudents = await _context.Users.Where(u => u.IsStudent).CountAsync();
                
                // Get pending teachers count
                var pendingTeachers = await _context.Users.Where(u => u.TeacherPendingApproval).CountAsync();
                
                // Get total courses count
                var totalCourses = await _context.Courses.CountAsync();
                
                // Get active courses (Status = 'Approved' or 'Published')
                var activeCourses = await _context.Courses
                    .Where(c => c.Status == "Approved" || c.Status == "Published")
                    .CountAsync();
                
                // Get total enrollments count
                var totalEnrollments = await _context.Enrollments.CountAsync();
                
                // Get completed enrollments (Status = 'Completed')
                var completedEnrollments = await _context.Enrollments
                    .Where(e => e.Status == "Completed")
                    .CountAsync();
                
                // Calculate course completion rate
                var courseCompletionRate = totalEnrollments > 0 
                    ? (double)completedEnrollments / totalEnrollments * 100 
                    : 0;

                // Get total revenue (sum of all payments with status Completed)
                var totalRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed")
                    .SumAsync(p => p.Amount);

                // Get total departments
                var totalDepartments = await _context.Departments.CountAsync();

                // Get active users (logged in last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var activeUsers = await _context.Users
                    .Where(u => u.LastLogin != null && u.LastLogin > thirtyDaysAgo)
                    .CountAsync();

                // Get new users this month
                var firstDayOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var newUsersThisMonth = await _context.Users
                    .Where(u => u.CreatedAt >= firstDayOfMonth)
                    .CountAsync();

                var stats = new PlatformStatsDTO
                {
                    TotalUsers = totalUsers,
                    TotalTeachers = totalTeachers,
                    TotalStudents = totalStudents,
                    TotalCourses = totalCourses,
                    TotalDepartments = totalDepartments,
                    PendingTeachers = pendingTeachers,
                    ActiveCourses = activeCourses,
                    TotalRevenue = totalRevenue,
                    ActiveUsers = activeUsers,
                    NewUsersThisMonth = newUsersThisMonth,
                    CourseCompletionRate = courseCompletionRate
                };

                return ServiceResult<PlatformStatsDTO>.SuccessResult(stats, "Platform stats retrieved successfully");
            }
            catch (Exception ex)
            {
                // Return failure so callers see the error instead of silent zeros
                return ServiceResult<PlatformStatsDTO>.FailureResult($"Failed to retrieve platform stats: {ex.Message}");
            }
        }

        /// <summary>
        /// Get recent activities across users, courses and payments for admin dashboard
        /// </summary>
        public async Task<ServiceResult<List<RecentActivityDTO>>> GetRecentActivities(int page = 1, int pageSize = 10)
        {
            try
            {
                var activities = new List<RecentActivityDTO>();

                // New users
                var newUsers = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Take(10)
                    .Select(u => new RecentActivityDTO
                    {
                        Action = "New user registered",
                        User = (u.FirstName + " " + u.LastName).Trim(),
                        Time = u.CreatedAt,
                        Meta = u.Email
                    })
                    .ToListAsync();

                activities.AddRange(newUsers);

                // Recently published/approved courses
                var recentCourses = await _context.Courses
                    .Where(c => c.PublishedAt != null || c.Status == "Published" || c.Status == "Approved")
                    .OrderByDescending(c => c.PublishedAt ?? c.CreatedAt)
                    .Take(10)
                    .Select(c => new RecentActivityDTO
                    {
                        Action = "Course published",
                        User = c.Teacher != null ? (c.Teacher.FirstName + " " + c.Teacher.LastName) : "",
                        Time = c.PublishedAt ?? c.CreatedAt,
                        Meta = c.Title
                    })
                    .ToListAsync();

                activities.AddRange(recentCourses);

                // Recent completed payments
                var payments = await _context.Payments
                    .Where(p => p.Status == "Completed")
                    .OrderByDescending(p => p.CreatedAt)
                    .Take(10)
                    .Select(p => new RecentActivityDTO
                    {
                        Action = "Payment received",
                        User = p.User != null ? (p.User.FirstName + " " + p.User.LastName) : "",
                        Time = p.CreatedAt,
                        Meta = $"{p.Amount} {p.Currency}"
                    })
                    .ToListAsync();

                activities.AddRange(payments);

                // Merge and sort by time desc, apply paging
                var merged = activities
                    .OrderByDescending(a => a.Time)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return ServiceResult<List<RecentActivityDTO>>.SuccessResult(merged, "Recent activities retrieved");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<RecentActivityDTO>>.FailureResult($"Failed to retrieve recent activities: {ex.Message}");
            }
        }

        /// <summary>
        /// Get top performing courses by enrollment count (with ratings/completion)
        /// </summary>
        public async Task<ServiceResult<List<TopCourseDTO>>> GetTopCourses(int count = 5)
        {
            try
            {
                var q = _context.Courses
                    .Where(c => c.Status == "Published" || c.Status == "Approved");

                var projected = q.Select(c => new
                {
                    Course = c,
                    EnrollmentCount = _context.Enrollments.Count(e => e.CourseId == c.Id),
                    AvgRating = _context.Reviews.Where(r => r.CourseId == c.Id).Select(r => (double?)r.Rating).Average() ?? 0.0,
                    Completed = _context.Enrollments.Count(e => e.CourseId == c.Id && e.Status == "Completed")
                })
                .OrderByDescending(x => x.EnrollmentCount)
                .Take(count);

                var list = await projected.ToListAsync();

                var result = list.Select(x => new TopCourseDTO
                {
                    Course = new CourseDTO
                    {
                        Id = x.Course.Id,
                        Title = x.Course.Title,
                        ShortDescription = x.Course.ShortDescription,
                        ThumbnailUrl = x.Course.ThumbnailUrl,
                        UniversityId = x.Course.UniversityId,
                        UniversityName = x.Course.University != null ? x.Course.University.Name : "",
                        DepartmentId = x.Course.DepartmentId,
                        DepartmentName = x.Course.Department != null ? x.Course.Department.Name : "",
                        TeacherId = x.Course.TeacherId,
                        TeacherName = x.Course.Teacher != null ? (x.Course.Teacher.FirstName + " " + x.Course.Teacher.LastName) : "",
                        CourseCode = x.Course.CourseCode,
                        CourseType = x.Course.CourseType,
                        IsFree = x.Course.IsFree,
                        Price = x.Course.Price,
                        EnrollmentCount = x.EnrollmentCount,
                        AverageRating = x.AvgRating,
                        TotalReviews = _context.Reviews.Count(r => r.CourseId == x.Course.Id),
                        Status = x.Course.Status,
                        CreatedAt = x.Course.CreatedAt,
                        PublishedAt = x.Course.PublishedAt
                    },
                    EnrollmentCount = x.EnrollmentCount,
                    AverageRating = (decimal)x.AvgRating,
                    CompletionRate = x.EnrollmentCount > 0 ? (decimal)x.Completed / x.EnrollmentCount * 100m : 0m
                }).ToList();

                return ServiceResult<List<TopCourseDTO>>.SuccessResult(result, "Top courses retrieved");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<TopCourseDTO>>.FailureResult($"Failed to get top courses: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<UserDTO>>> GetAllUsers(UserFilterDTO filterDto)
        {
            try
            {
                var query = _context.Users.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(filterDto?.Search))
                {
                    var s = filterDto.Search.Trim().ToLower();
                    query = query.Where(u => u.FirstName.ToLower().Contains(s) || u.LastName.ToLower().Contains(s) || u.Email.ToLower().Contains(s) || u.Username.ToLower().Contains(s));
                }

                if (!string.IsNullOrWhiteSpace(filterDto?.Role))
                {
                    var role = (filterDto.Role ?? "").ToLower();
                    if (role == "student") query = query.Where(u => u.IsStudent);
                    else if (role == "teacher") query = query.Where(u => u.IsTeacher);
                    else if (role == "admin") query = query.Where(u => u.IsAdmin);
                }

                if (filterDto?.IsActive != null)
                {
                    // Assuming Active means not soft-deleted; placeholder if an IsActive flag exists later
                }

                // Sorting
                if (!string.IsNullOrWhiteSpace(filterDto?.SortBy))
                {
                    if (filterDto.SortBy == "newest") query = query.OrderByDescending(u => u.CreatedAt);
                    else if (filterDto.SortBy == "oldest") query = query.OrderBy(u => u.CreatedAt);
                    else query = query.OrderByDescending(u => u.CreatedAt);
                }
                else
                {
                    query = query.OrderByDescending(u => u.CreatedAt);
                }

                // Apply a sensible limit to avoid returning extremely large lists
                var users = await query.Take(1000).ToListAsync();

                var dtos = users.Select(MapUserToDTO).ToList();

                return ServiceResult<List<UserDTO>>.SuccessResult(dtos, $"Retrieved {dtos.Count} users");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<UserDTO>>.FailureResult($"Failed to get users: {ex.Message}");
            }
        }

        public Task<ServiceResult<UserDTO>> UpdateUserStatus(int userId, UpdateUserStatusDTO dto)
            => Task.FromResult(ServiceResult<UserDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<UserDTO>> UpdateUserRole(int userId, UpdateUserRoleDTO dto)
            => Task.FromResult(ServiceResult<UserDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<CourseDTO>>> GetPendingCourses(CourseApprovalFilterDTO filterDto)
            => Task.FromResult(ServiceResult<List<CourseDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> ApproveCourse(int courseId, ApproveCourseDTO dto)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> RejectCourse(int courseId, RejectCourseDTO dto)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<ContentModerationDTO>>> GetFlaggedContent()
            => Task.FromResult(ServiceResult<List<ContentModerationDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> ApproveContent(int contentId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> DeleteFlaggedContent(int contentId, string reason)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<BackupDTO>>> GetBackups()
            => Task.FromResult(ServiceResult<List<BackupDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<BackupDTO>> CreateBackup(CreateBackupDTO dto)
            => Task.FromResult(ServiceResult<BackupDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> RestoreBackup(string backupId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<ExportResultDTO>> ExportData(ExportDataDTO dto)
            => Task.FromResult(ServiceResult<ExportResultDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> SendBulkEmail(EmailDTO dto, List<int> userIds)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> SendSystemNotification(CreateNotificationDTO dto)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<DashboardCardDTO>>> GetAdminDashboardCards()
            => Task.FromResult(ServiceResult<List<DashboardCardDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<SiteConfigDTO>> GetSiteConfig()
            => Task.FromResult(ServiceResult<SiteConfigDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<SiteConfigDTO>> UpdateSiteConfig(SiteConfigDTO dto)
            => Task.FromResult(ServiceResult<SiteConfigDTO>.FailureResult("Not implemented"));
    }
}
