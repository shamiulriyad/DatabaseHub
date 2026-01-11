using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly ApplicationDbContext _context;

        public TeacherService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<TeacherApplicationDTO>> ApplyToBeTeacher(int userId, ApplyTeacherDTO dto)
        {
            try
            {
                // Get user
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return ServiceResult<TeacherApplicationDTO>.FailureResult("User not found");

                // Check if user is admin (admins can't apply)
                if (user.IsAdmin)
                    return ServiceResult<TeacherApplicationDTO>.FailureResult("Admins cannot apply as teachers");

                // Check for existing pending application
                var existingPending = await _context.TeacherApplications
                    .FirstOrDefaultAsync(a => a.UserId == userId && a.Status == "Pending");
                
                if (existingPending != null)
                    return ServiceResult<TeacherApplicationDTO>.FailureResult("You already have a pending teacher application");

                // Check if already a teacher
                if (user.IsTeacher)
                    return ServiceResult<TeacherApplicationDTO>.FailureResult("You are already a teacher");

                // Create application
                var application = new TeacherApplication
                {
                    UserId = userId,
                    ReasonForApplying = dto.ReasonForApplying,
                    QualificationDetails = dto.QualificationDetails,
                    ExperienceArea = dto.ExperienceArea,
                    Status = "Pending",
                    ApplicationDate = DateTime.UtcNow
                };

                _context.TeacherApplications.Add(application);
                // Mark user as having a pending teacher approval request for Admin dashboards
                user.TeacherPendingApproval = true;
                user.TeacherRequestDate = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                var responseDto = MapToDTO(application, user);
                return ServiceResult<TeacherApplicationDTO>.SuccessResult(
                    responseDto, 
                    "Teacher application submitted successfully. Please wait for admin approval."
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<TeacherApplicationDTO>.FailureResult($"Failed to submit application: {ex.Message}");
            }
        }

        public async Task<ServiceResult<TeacherApplicationDTO>> GetMyApplicationStatus(int userId)
        {
            try
            {
                var application = await _context.TeacherApplications
                    .Include(a => a.User)
                    .Include(a => a.ReviewedByAdmin)
                    .FirstOrDefaultAsync(a => a.UserId == userId);

                if (application == null)
                    return ServiceResult<TeacherApplicationDTO>.FailureResult("No application found");

                var responseDto = MapToDTO(application, application.User!);
                return ServiceResult<TeacherApplicationDTO>.SuccessResult(responseDto);
            }
            catch (Exception ex)
            {
                return ServiceResult<TeacherApplicationDTO>.FailureResult($"Failed to get application status: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<TeacherApplicationListDTO>>> GetAllApplications(string? status = null)
        {
            try
            {
                var query = _context.TeacherApplications
                    .Include(a => a.User)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(a => a.Status == status);

                var applications = await query
                    .OrderByDescending(a => a.ApplicationDate)
                    .ToListAsync();

                var dtos = applications.Select(a => new TeacherApplicationListDTO
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    ApplicantName = $"{a.User?.FirstName} {a.User?.LastName}",
                    ApplicantEmail = a.User?.Email ?? "Unknown",
                    FirstName = a.User?.FirstName ?? "Unknown",
                    LastName = a.User?.LastName ?? "Unknown",
                    UserName = a.User?.Username ?? "Unknown",
                    UserEmail = a.User?.Email ?? "Unknown",
                    Status = a.Status,
                    ApplicationDate = a.ApplicationDate,
                    ReasonForApplying = a.ReasonForApplying,
                    ExperienceArea = a.ExperienceArea,
                    QualificationDetails = a.QualificationDetails
                }).ToList();

                return ServiceResult<List<TeacherApplicationListDTO>>.SuccessResult(dtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<TeacherApplicationListDTO>>.FailureResult($"Failed to get applications: {ex.Message}");
            }
        }

        public async Task<ServiceResult<TeacherApplicationDTO>> GetApplicationDetails(int applicationId)
        {
            try
            {
                var application = await _context.TeacherApplications
                    .Include(a => a.User)
                    .Include(a => a.ReviewedByAdmin)
                    .FirstOrDefaultAsync(a => a.Id == applicationId);

                if (application == null)
                    return ServiceResult<TeacherApplicationDTO>.FailureResult("Application not found");

                var responseDto = MapToDTO(application, application.User!);
                return ServiceResult<TeacherApplicationDTO>.SuccessResult(responseDto);
            }
            catch (Exception ex)
            {
                return ServiceResult<TeacherApplicationDTO>.FailureResult($"Failed to get application details: {ex.Message}");
            }
        }

        public async Task<ServiceResult<TeacherApplicationDTO>> ReviewApplication(int applicationId, ReviewTeacherApplicationDTO reviewDto, int adminId)
        {
            try
            {
                var application = await _context.TeacherApplications
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(a => a.Id == applicationId);

                if (application == null)
                    return ServiceResult<TeacherApplicationDTO>.FailureResult("Application not found");

                if (application.Status != "Pending")
                    return ServiceResult<TeacherApplicationDTO>.FailureResult("This application has already been reviewed");

                var admin = await _context.Users.FindAsync(adminId);
                if (admin == null || !admin.IsAdmin)
                    return ServiceResult<TeacherApplicationDTO>.FailureResult("Unauthorized: Admin access required");

                // Update application
                application.Status = reviewDto.Decision;
                application.ReviewedDate = DateTime.UtcNow;
                application.ReviewedByAdminId = adminId;
                application.AdminRemarks = reviewDto.AdminRemarks;

                // If approved, update user role
                if (reviewDto.Decision == "Approved")
                {
                    application.User!.IsTeacher = true;
                    application.ApprovedDate = DateTime.UtcNow;
                }

                // In all review outcomes, clear the user's pending flag
                application.User!.TeacherPendingApproval = false;
                application.User!.UpdatedAt = DateTime.UtcNow;

                _context.TeacherApplications.Update(application);
                _context.Users.Update(application.User!);
                await _context.SaveChangesAsync();

                var responseDto = MapToDTO(application, application.User!);
                return ServiceResult<TeacherApplicationDTO>.SuccessResult(
                    responseDto,
                    $"Application {reviewDto.Decision.ToLower()} successfully"
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<TeacherApplicationDTO>.FailureResult($"Failed to review application: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> HasPendingApplication(int userId)
        {
            try
            {
                var hasPending = await _context.TeacherApplications
                    .AnyAsync(a => a.UserId == userId && a.Status == "Pending");

                return ServiceResult<bool>.SuccessResult(hasPending);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to check application status: {ex.Message}");
            }
        }

        // Helper: Map Model to DTO
        private TeacherApplicationDTO MapToDTO(TeacherApplication application, User user)
        {
            return new TeacherApplicationDTO
            {
                Id = application.Id,
                UserId = application.UserId,
                UserName = user.Username,
                UserEmail = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ReasonForApplying = application.ReasonForApplying,
                QualificationDetails = application.QualificationDetails,
                ExperienceArea = application.ExperienceArea,
                Status = application.Status,
                ApplicationDate = application.ApplicationDate,
                ReviewedDate = application.ReviewedDate,
                ReviewedByAdminId = application.ReviewedByAdminId,
                AdminRemarks = application.AdminRemarks,
                ApprovedDate = application.ApprovedDate
            };
        }

        public async Task<User?> GetUserById(int userId)
        {
            try
            {
                return await _context.Users.FindAsync(userId);
            }
            catch
            {
                return null;
            }
        }
    }
}
