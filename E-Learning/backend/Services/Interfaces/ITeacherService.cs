using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface ITeacherService
    {
        // User applies to become teacher
        Task<ServiceResult<TeacherApplicationDTO>> ApplyToBeTeacher(int userId, ApplyTeacherDTO dto, string idFrontImagePath, string idBackImagePath);

        // Get user's current application status
        Task<ServiceResult<TeacherApplicationDTO>> GetMyApplicationStatus(int userId);

        // Admin: Get all applications (with filters)
        Task<ServiceResult<List<TeacherApplicationListDTO>>> GetAllApplications(string? status = null);

        // Admin: Get single application details
        Task<ServiceResult<TeacherApplicationDTO>> GetApplicationDetails(int applicationId);

        // Admin: Review and approve/reject application
        Task<ServiceResult<TeacherApplicationDTO>> ReviewApplication(int applicationId, ReviewTeacherApplicationDTO reviewDto, int adminId);

        // Check if user has pending application
        Task<ServiceResult<bool>> HasPendingApplication(int userId);

        // Get user by ID (for admin verification)
        Task<User?> GetUserById(int userId);
    }
}
