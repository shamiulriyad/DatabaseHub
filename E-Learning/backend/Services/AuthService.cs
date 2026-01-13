using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using backend.Helpers;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtHelper _jwtHelper;

        public AuthService(ApplicationDbContext context, IPasswordHasher passwordHasher, IJwtHelper jwtHelper)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtHelper = jwtHelper;
        }

        public async Task<ServiceResult<AuthResponseDTO>> Register(RegisterDTO dto)
        {
            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email || u.Username == dto.Username);
            
            if (existingUser != null)
                return ServiceResult<AuthResponseDTO>.FailureResult("User already exists with this email or username");

            try
            {
                // Create new user as Student (active immediately, no approval needed)
                var user = new User
                {
                    Username = dto.Username,
                    Email = dto.Email,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    PasswordHash = _passwordHasher.HashPassword(dto.Password),
                    PhoneNumber = dto.PhoneNumber,
                    DateOfBirth = dto.DateOfBirth,
                    ProfileImageUrl = dto.ProfileImageUrl,
                    IsStudent = true, // Active immediately
                    IsTeacher = false,
                    TeacherPendingApproval = false,
                    IsCompetitor = false,
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Generate token
                var token = _jwtHelper.GenerateToken(user);

                var response = new AuthResponseDTO
                {
                    Token = token,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    User = MapUserToDTO(user)
                };

                return ServiceResult<AuthResponseDTO>.SuccessResult(response, "Registration successful");
            }
            catch (Exception ex)
            {
                return ServiceResult<AuthResponseDTO>.FailureResult($"Registration failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<AuthResponseDTO>> Login(LoginDTO dto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                
                if (user == null)
                    return ServiceResult<AuthResponseDTO>.FailureResult("User not found with this email");

                if (!_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
                    return ServiceResult<AuthResponseDTO>.FailureResult("Incorrect password");

                // Update last login
                user.LastLogin = DateTime.UtcNow;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                // Generate token
                var token = _jwtHelper.GenerateToken(user);

                var response = new AuthResponseDTO
                {
                    Token = token,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    User = MapUserToDTO(user)
                };

                return ServiceResult<AuthResponseDTO>.SuccessResult(response, "Login successful");
            }
            catch (Exception ex)
            {
                return ServiceResult<AuthResponseDTO>.FailureResult($"Login failed: {ex.Message}");
            }
        }







        public async Task<ServiceResult<bool>> ChangePassword(int userId, ChangePasswordDTO dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                    return ServiceResult<bool>.FailureResult("User not found");

                // Verify old password
                if (!_passwordHasher.VerifyPassword(dto.OldPassword, user.PasswordHash))
                    return ServiceResult<bool>.FailureResult("Current password is incorrect");

                // Hash and update new password
                user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;
                
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true, "Password changed successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Password change failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<UserDTO>> GetUserProfile(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                    return ServiceResult<UserDTO>.FailureResult("User not found");

                // Get user's current clan membership
                var clanMembership = await _context.ClanMembers
                    .Include(cm => cm.Clan)
                    .FirstOrDefaultAsync(cm => cm.UserId == userId);

                UserClanDTO? currentClan = null;
                if (clanMembership != null)
                {
                    currentClan = new UserClanDTO
                    {
                        ClanId = clanMembership.ClanId,
                        ClanName = clanMembership.Clan.Name,
                        ClanTag = clanMembership.Clan.Tag,
                        ClanLogoUrl = clanMembership.Clan.LogoUrl,
                        Role = clanMembership.Role,
                        ContributionPoints = clanMembership.ContributionPoints,
                        JoinedAt = clanMembership.JoinedAt
                    };
                }

                var userDto = new UserDTO
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Username = user.Username,
                    IsStudent = user.IsStudent,
                    IsTeacher = user.IsTeacher,
                    IsAdmin = user.IsAdmin,
                    IsCompetitor = user.IsCompetitor,
                    TotalPoints = user.TotalPoints,
                    CurrentRank = user.CurrentRank,
                    CreatedAt = user.CreatedAt,
                    CurrentClan = currentClan
                };

                return ServiceResult<UserDTO>.SuccessResult(userDto);
            }
            catch (Exception ex)
            {
                return ServiceResult<UserDTO>.FailureResult($"Failed to get profile: {ex.Message}");
            }
        }

        public async Task<ServiceResult<UserDTO>> UpdateProfile(int userId, UpdateProfileDTO dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                    return ServiceResult<UserDTO>.FailureResult("User not found");

                // Update fields
                if (!string.IsNullOrEmpty(dto.FirstName))
                    user.FirstName = dto.FirstName;
                if (!string.IsNullOrEmpty(dto.LastName))
                    user.LastName = dto.LastName;
                if (!string.IsNullOrEmpty(dto.Email))
                    user.Email = dto.Email;
                if (!string.IsNullOrEmpty(dto.Username))
                    user.Username = dto.Username;
                if (!string.IsNullOrEmpty(dto.Bio))
                    user.Bio = dto.Bio;
                if (!string.IsNullOrEmpty(dto.PhoneNumber))
                    user.PhoneNumber = dto.PhoneNumber;
                if (!string.IsNullOrEmpty(dto.ProfileImageUrl))
                    user.ProfileImageUrl = dto.ProfileImageUrl;
                if (!string.IsNullOrEmpty(dto.Address))
                    user.Address = dto.Address;
                if (dto.DateOfBirth.HasValue)
                    user.DateOfBirth = dto.DateOfBirth;
                    
                user.UpdatedAt = DateTime.UtcNow;
                
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                var userDto = new UserDTO
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Username = user.Username,
                    IsStudent = user.IsStudent,
                    IsTeacher = user.IsTeacher,
                    IsAdmin = user.IsAdmin,
                    IsCompetitor = user.IsCompetitor,
                    TotalPoints = user.TotalPoints,
                    CurrentRank = user.CurrentRank,
                    CreatedAt = user.CreatedAt
                };

                return ServiceResult<UserDTO>.SuccessResult(userDto, "Profile updated successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<UserDTO>.FailureResult($"Profile update failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> ForgotPassword(string email)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                
                if (user == null)
                    return ServiceResult<bool>.SuccessResult(true, "If this email exists, a password reset link has been sent");

                // Generate secure reset token
                var resetToken = Guid.NewGuid().ToString() + Guid.NewGuid().ToString().Replace("-", "");
                
                // Store token and expiry (valid for 1 hour)
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
                user.UpdatedAt = DateTime.UtcNow;
                
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                // TODO: Send email with reset link
                // var resetLink = $"http://yourfrontend.com/reset-password?token={resetToken}";
                // await _emailService.SendPasswordResetEmail(user.Email, user.FirstName, resetLink);
                
                return ServiceResult<bool>.SuccessResult(true, "Password reset instructions sent to your email");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Password reset failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> ResetPassword(string token, string newPassword)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => 
                    u.PasswordResetToken == token && 
                    u.PasswordResetTokenExpiry > DateTime.UtcNow);
                
                if (user == null)
                    return ServiceResult<bool>.FailureResult("Invalid or expired reset token");

                // Update password
                user.PasswordHash = _passwordHasher.HashPassword(newPassword);
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;
                
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true, "Password reset successful");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Password reset failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<UserDTO>> BecomeTeacher(int userId)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                
                if (user == null)
                    return ServiceResult<UserDTO>.FailureResult("User not found");

                // If already a teacher (approved), return error
                if (user.IsTeacher && !user.TeacherPendingApproval)
                    return ServiceResult<UserDTO>.FailureResult("User is already an approved teacher");

                // If already pending approval, return info message
                if (user.TeacherPendingApproval)
                    return ServiceResult<UserDTO>.FailureResult("Teacher approval request is already pending");

                // Set as pending approval
                user.TeacherPendingApproval = true;
                user.TeacherRequestDate = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return ServiceResult<UserDTO>.SuccessResult(
                    MapUserToDTO(user),
                    "Teacher approval request submitted. Admin will review and approve your request."
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<UserDTO>.FailureResult($"Failed to request teacher role: {ex.Message}");
            }
        }

        public Task<ServiceResult<UserDTO>> JoinCompetitionMode(int userId)
            => Task.FromResult(ServiceResult<UserDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<DashboardDTO>> GetUserDashboard(int userId)
            => Task.FromResult(ServiceResult<DashboardDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<User>> GetUserById(int userId)
            => Task.FromResult(ServiceResult<User>.FailureResult("Not implemented"));

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
    }
}
