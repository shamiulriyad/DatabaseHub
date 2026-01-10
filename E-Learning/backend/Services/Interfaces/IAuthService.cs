using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResult<AuthResponseDTO>> Register(RegisterDTO registerDto);
        Task<ServiceResult<AuthResponseDTO>> Login(LoginDTO loginDto);
        Task<ServiceResult<UserDTO>> GetUserProfile(int userId);
        Task<ServiceResult<UserDTO>> UpdateProfile(int userId, UpdateProfileDTO profileDto);
        Task<ServiceResult<bool>> ChangePassword(int userId, ChangePasswordDTO passwordDto);
        Task<ServiceResult<bool>> ForgotPassword(string email);
        Task<ServiceResult<bool>> ResetPassword(string token, string newPassword);
        Task<ServiceResult<UserDTO>> BecomeTeacher(int userId);
        Task<ServiceResult<UserDTO>> JoinCompetitionMode(int userId);
        Task<ServiceResult<DashboardDTO>> GetUserDashboard(int userId);
        Task<ServiceResult<User>> GetUserById(int userId);
    }
}