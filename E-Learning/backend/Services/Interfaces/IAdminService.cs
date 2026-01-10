using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IAdminService
    {
        // Teacher Approval Methods
        Task<ServiceResult<List<UserDTO>>> GetPendingTeacherApprovals(int page = 1, int pageSize = 20);
        Task<ServiceResult<int>> GetPendingTeacherApprovalsCount();
        Task<ServiceResult<UserDTO>> ApproveTeacherRequest(int userId);
        Task<ServiceResult<bool>> RejectTeacherRequest(int userId, string reason = "");

        // Existing methods
        Task<ServiceResult<PlatformStatsDTO>> GetPlatformStats();
        Task<ServiceResult<List<UserDTO>>> GetAllUsers(UserFilterDTO filterDto);
        Task<ServiceResult<UserDTO>> UpdateUserStatus(int userId, UpdateUserStatusDTO dto);
        Task<ServiceResult<UserDTO>> UpdateUserRole(int userId, UpdateUserRoleDTO dto);
        Task<ServiceResult<List<CourseDTO>>> GetPendingCourses(CourseApprovalFilterDTO filterDto);
        Task<ServiceResult<bool>> ApproveCourse(int courseId, ApproveCourseDTO dto);
        Task<ServiceResult<bool>> RejectCourse(int courseId, RejectCourseDTO dto);
        Task<ServiceResult<List<ContentModerationDTO>>> GetFlaggedContent();
        Task<ServiceResult<bool>> ApproveContent(int contentId);
        Task<ServiceResult<bool>> DeleteFlaggedContent(int contentId, string reason);
        Task<ServiceResult<List<BackupDTO>>> GetBackups();
        Task<ServiceResult<BackupDTO>> CreateBackup(CreateBackupDTO dto);
        Task<ServiceResult<bool>> RestoreBackup(string backupId);
        Task<ServiceResult<ExportResultDTO>> ExportData(ExportDataDTO dto);
        Task<ServiceResult<bool>> SendBulkEmail(EmailDTO dto, List<int> userIds);
        Task<ServiceResult<bool>> SendSystemNotification(CreateNotificationDTO dto);
        Task<ServiceResult<List<DashboardCardDTO>>> GetAdminDashboardCards();
        Task<ServiceResult<SiteConfigDTO>> GetSiteConfig();
        Task<ServiceResult<SiteConfigDTO>> UpdateSiteConfig(SiteConfigDTO dto);
    }
}
