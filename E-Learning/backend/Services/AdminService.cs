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
                TotalPoints = user.TotalPoints,
                CurrentRank = user.CurrentRank,
                TotalCoursesEnrolled = user.TotalCoursesEnrolled,
                TotalCoursesCompleted = user.TotalCoursesCompleted,
                AverageGrade = user.AverageGrade,
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

                // Get active users (logged in last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var activeUsers = await _context.Users
                    .Where(u => u.LastLogin != null && u.LastLogin > thirtyDaysAgo)
                    .CountAsync();

                // Get new users this month
                var firstDayOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
                var newUsersThisMonth = await _context.Users
                    .Where(u => u.CreatedAt >= firstDayOfMonth)
                    .CountAsync();

                var stats = new PlatformStatsDTO
                {
                    TotalUsers = totalUsers,
                    TotalTeachers = totalTeachers,
                    TotalStudents = totalStudents,
                    TotalCourses = totalCourses,
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
                // Fallback to zeroed stats to prevent admin dashboard from breaking
                var fallbackStats = new PlatformStatsDTO
                {
                    TotalUsers = 0,
                    TotalTeachers = 0,
                    TotalStudents = 0,
                    TotalCourses = 0,
                    PendingTeachers = 0,
                    ActiveCourses = 0,
                    TotalRevenue = 0,
                    ActiveUsers = 0,
                    NewUsersThisMonth = 0,
                    CourseCompletionRate = 0,
                    // Legacy fields
                    TotalUniversities = 0,
                    TotalDepartments = 0,
                    TotalEnrollments = 0,
                    TotalPosts = 0,
                    TotalComments = 0,
                    TotalClans = 0,
                    TotalCompetitions = 0,
                    ActiveUsersToday = 0,
                    NewUsersToday = 0,
                    NewCoursesToday = 0,
                    PendingCourses = 0,
                    PendingWithdrawals = 0,
                    TodayRevenue = 0,
                    PlatformBalance = 0
                };

                return ServiceResult<PlatformStatsDTO>.SuccessResult(
                    fallbackStats,
                    $"Platform stats fallback due to error: {ex.Message}"
                );
            }
        }

        public Task<ServiceResult<List<UserDTO>>> GetAllUsers(UserFilterDTO filterDto)
            => Task.FromResult(ServiceResult<List<UserDTO>>.FailureResult("Not implemented"));

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
