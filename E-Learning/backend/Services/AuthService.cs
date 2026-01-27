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

                // Get user's current clan membership (if any)
                // Use projection to avoid large joins that can exhaust Postgres memory.
                var clanMembership = await _context.ClanMembers
                    .Where(cm => cm.UserId == userId)
                    .Select(cm => new
                    {
                        cm.ClanId,
                        cm.Role,
                        cm.ContributionPoints,
                        cm.JoinedAt,
                        ClanName = cm.Clan.Name,
                        ClanTag = cm.Clan.Tag,
                        ClanLogoUrl = cm.Clan.LogoUrl
                    })
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                UserClanDTO? currentClan = null;
                if (clanMembership != null)
                {
                    currentClan = new UserClanDTO
                    {
                        ClanId = clanMembership.ClanId,
                        ClanName = clanMembership.ClanName,
                        ClanTag = clanMembership.ClanTag,
                        ClanLogoUrl = clanMembership.ClanLogoUrl,
                        Role = clanMembership.Role,
                        ContributionPoints = clanMembership.ContributionPoints,
                        JoinedAt = clanMembership.JoinedAt
                    };
                }

                // Use the central mapper so ProfileImageUrl and CoverImageUrl are included
                var mapped = MapUserToDTO(user);
                mapped.CurrentClan = currentClan;

                return ServiceResult<UserDTO>.SuccessResult(mapped);
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
                if (!string.IsNullOrEmpty(dto.CoverImageUrl))
                    user.CoverImageUrl = dto.CoverImageUrl;
                if (!string.IsNullOrEmpty(dto.Address))
                    user.Address = dto.Address;
                if (dto.DateOfBirth.HasValue)
                    user.DateOfBirth = dto.DateOfBirth;
                    
                user.UpdatedAt = DateTime.UtcNow;
                
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                // Return full mapped DTO so caller receives Profile/Cover image URLs and other fields
                var mapped = MapUserToDTO(user);
                return ServiceResult<UserDTO>.SuccessResult(mapped, "Profile updated successfully");
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

        public async Task<ServiceResult<DashboardDTO>> GetUserDashboard(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return ServiceResult<DashboardDTO>.FailureResult("User not found");

                // Map basic user DTO and current clan
                var mappedUser = MapUserToDTO(user);

                var clanMembership = await _context.ClanMembers
                    .Where(cm => cm.UserId == userId)
                    .Select(cm => new
                    {
                        cm.ClanId,
                        cm.Role,
                        cm.ContributionPoints,
                        cm.JoinedAt,
                        ClanName = cm.Clan.Name,
                        ClanTag = cm.Clan.Tag,
                        ClanLogoUrl = cm.Clan.LogoUrl
                    })
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (clanMembership != null)
                {
                    mappedUser.CurrentClan = new UserClanDTO
                    {
                        ClanId = clanMembership.ClanId,
                        ClanName = clanMembership.ClanName,
                        ClanTag = clanMembership.ClanTag,
                        ClanLogoUrl = clanMembership.ClanLogoUrl,
                        Role = clanMembership.Role,
                        ContributionPoints = clanMembership.ContributionPoints,
                        JoinedAt = clanMembership.JoinedAt
                    };
                }

                // Recent enrollments
                var recentEnrollments = await _context.Enrollments
                    .Where(e => e.UserId == userId)
                    .OrderByDescending(e => e.EnrolledAt)
                    .Take(5)
                    .Select(e => new EnrollmentDTO
                    {
                        Id = e.Id,
                        UserId = e.UserId,
                        CourseId = e.CourseId,
                        CourseTitle = e.Course.Title,
                        CourseThumbnail = e.Course.ThumbnailUrl,
                        CourseBannerUrl = e.Course.ThumbnailUrl,
                        Instructor = e.Course.Teacher != null ? (e.Course.Teacher.FirstName + " " + e.Course.Teacher.LastName) : null,
                        InstructorAvatar = e.Course.Teacher.ProfileImageUrl,
                        CourseTotalLessons = e.Course.TotalLessons,
                        EnrollmentType = e.EnrollmentType,
                        EnrolledAt = e.EnrolledAt,
                        CompletedAt = e.CompletedAt,
                        LastAccessed = e.LastAccessed,
                        ExpiryDate = e.ExpiryDate,
                        CompletedLessons = e.CompletedLessons,
                        TotalLessons = e.TotalLessons,
                        CompletedModules = e.CompletedModules,
                        TotalModules = e.TotalModules,
                        ProgressPercentage = e.ProgressPercentage,
                        QuizAverage = e.QuizAverage,
                        AssignmentAverage = e.AssignmentAverage,
                        FinalGrade = e.FinalGrade,
                        GradeLetter = e.GradeLetter,
                        PointsEarned = e.PointsEarned,
                        Status = e.Status,
                        AmountPaid = e.AmountPaid,
                        PaymentStatus = e.PaymentStatus,
                        CertificateEarned = e.CertificateEarned,
                        CertificateUrl = e.CertificateUrl
                    })
                    .AsNoTracking()
                    .ToListAsync();

                // Post-process to fill missing totals and completed lessons for older enrollments
                foreach (var dto in recentEnrollments)
                {
                    if (dto.TotalLessons == 0 && dto.CourseTotalLessons > 0)
                    {
                        dto.TotalLessons = dto.CourseTotalLessons;
                    }

                    if (dto.CompletedLessons == 0 && dto.TotalLessons > 0 && dto.ProgressPercentage > 0)
                    {
                        try
                        {
                            dto.CompletedLessons = (int)Math.Round((double)(dto.ProgressPercentage / 100m) * dto.TotalLessons);
                        }
                        catch
                        {
                            // ignore math errors and leave completed as-is
                        }
                    }
                }

                // If CourseTotalLessons still missing (0), compute from CourseParts count
                foreach (var dto in recentEnrollments.Where(d => d.TotalLessons == 0 && d.CourseTotalLessons == 0))
                {
                    try
                    {
                        var partsCount = await _context.CourseParts.CountAsync(p => p.CourseId == dto.CourseId);
                        if (partsCount > 0)
                        {
                            dto.CourseTotalLessons = partsCount;
                            dto.TotalLessons = partsCount;

                            if (dto.CompletedLessons == 0 && dto.ProgressPercentage > 0)
                            {
                                dto.CompletedLessons = (int)Math.Round((double)(dto.ProgressPercentage / 100m) * dto.TotalLessons);
                            }
                        }
                    }
                    catch
                    {
                        // ignore DB errors; leave dto values as-is
                    }
                }

                // Recommended courses (popular)
                var recommendedCourses = await _context.Courses
                    .Where(c => c.Status == "Approved")
                    .OrderByDescending(c => c.EnrollmentCount)
                    .Take(5)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        ShortDescription = c.ShortDescription,
                        FullDescription = c.FullDescription,
                        ThumbnailUrl = c.ThumbnailUrl,
                        UniversityId = c.UniversityId,
                        UniversityName = c.University != null ? c.University.Name : "",
                        DepartmentId = c.DepartmentId,
                        DepartmentName = c.Department != null ? c.Department.Name : "",
                        TeacherId = c.TeacherId,
                        TeacherName = c.Teacher != null ? c.Teacher.FirstName + " " + c.Teacher.LastName : "",
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
                        PublishedAt = c.PublishedAt
                    })
                    .AsNoTracking()
                    .ToListAsync();

                // Upcoming competitions
                var now = DateTime.UtcNow;
                var upcomingCompetitions = await _context.Competitions
                    .Where(cm => cm.StartDate >= now && cm.Status != "Completed")
                    .OrderBy(cm => cm.StartDate)
                    .Take(5)
                    .Select(cm => new CompetitionDTO
                    {
                        Id = cm.Id,
                        Title = cm.Title,
                        Description = cm.Description,
                        CompetitionType = cm.CompetitionType,
                        UniversityId = cm.UniversityId,
                        DepartmentId = cm.DepartmentId,
                        CourseId = cm.CourseId,
                        ClanId = cm.ClanId,
                        StartDate = cm.StartDate,
                        EndDate = cm.EndDate,
                        DurationMinutes = cm.DurationMinutes,
                        IsLive = cm.IsLive,
                        MaxParticipants = cm.MaxParticipants,
                        IsPublic = cm.IsPublic,
                        ParticipantCount = cm.ParticipantCount,
                        Status = cm.Status,
                        CreatedAt = cm.CreatedAt
                    })
                    .AsNoTracking()
                    .ToListAsync();

                // My clans
                var myClans = await _context.ClanMembers
                    .Where(cm => cm.UserId == userId)
                    .OrderByDescending(cm => cm.JoinedAt)
                    .Select(cm => new ClanDTO
                    {
                        Id = cm.Clan.Id,
                        Name = cm.Clan.Name,
                        Tag = cm.Clan.Tag,
                        Description = cm.Clan.Description,
                        LeaderId = cm.Clan.LeaderId,
                        LogoUrl = cm.Clan.LogoUrl,
                        BannerUrl = cm.Clan.BannerUrl,
                        ClanType = cm.Clan.ClanType,
                        UniversityId = cm.Clan.UniversityId,
                        DepartmentId = cm.Clan.DepartmentId,
                        CourseId = cm.Clan.CourseId,
                        MemberCount = cm.Clan.MemberCount,
                        TotalPoints = cm.Clan.TotalPoints,
                        WeeklyPoints = cm.Clan.WeeklyPoints,
                        MonthlyPoints = cm.Clan.MonthlyPoints,
                        Rank = cm.Clan.Rank,
                        CreatedAt = cm.Clan.CreatedAt
                    })
                    .AsNoTracking()
                    .ToListAsync();

                // Stats
                var totalEnrollments = await _context.Enrollments.CountAsync(e => e.UserId == userId);
                var completedCourses = await _context.Enrollments.CountAsync(e => e.UserId == userId && e.Status == "Completed");
                var ongoingCourses = await _context.Enrollments.CountAsync(e => e.UserId == userId && e.Status == "Active");
                var gradesQuery = _context.Enrollments
                    .Where(e => e.UserId == userId && e.FinalGrade != null);

                decimal averageScore = 0;
                if (await gradesQuery.AnyAsync())
                {
                    averageScore = await gradesQuery.AverageAsync(e => e.FinalGrade.Value);
                }

                var totalCompetitions = await _context.CompetitionParticipants.CountAsync(cp => cp.UserId == userId);
                var competitionWins = await _context.CompetitionParticipants.CountAsync(cp => cp.UserId == userId && cp.Rank == 1);

                var stats = new DashboardStatsDTO
                {
                    TotalEnrollments = totalEnrollments,
                    CompletedCourses = completedCourses,
                    OngoingCourses = ongoingCourses,
                    AverageScore = (decimal)averageScore,
                    CurrentStreak = user.StreakDays,
                    // TotalPoints removed
                    Rank = user.CurrentRank,
                    TotalCompetitions = totalCompetitions,
                    CompetitionWins = competitionWins
                };

                var dash = new DashboardDTO
                {
                    User = mappedUser,
                    RecentEnrollments = recentEnrollments,
                    RecommendedCourses = recommendedCourses,
                    UpcomingCompetitions = upcomingCompetitions,
                    MyClans = myClans,
                    Stats = stats
                };

                return ServiceResult<DashboardDTO>.SuccessResult(dash);
            }
            catch (Exception ex)
            {
                return ServiceResult<DashboardDTO>.FailureResult($"Failed to build dashboard: {ex.Message}");
            }
        }

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
                CoverImageUrl = user.CoverImageUrl,
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
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin
            };
        }
    }
}
