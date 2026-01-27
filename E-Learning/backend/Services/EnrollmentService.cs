using backend.Data;
using backend.DTOs;
using backend.Hubs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class EnrollmentService : IEnrollmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<CourseHub>? _hubContext;

        public EnrollmentService(ApplicationDbContext context, IHubContext<CourseHub>? hubContext = null)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<ServiceResult<EnrollmentDTO>> EnrollInCourse(int courseId, int userId)
        {
            try
            {
                var course = await _context.Courses.FindAsync(courseId);
                if (course == null) return ServiceResult<EnrollmentDTO>.FailureResult("Course not found");

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return ServiceResult<EnrollmentDTO>.FailureResult("User not found");

                var existing = await _context.Enrollments.FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);
                if (existing != null)
                {
                    var existingTeacher = await _context.Users.FindAsync(course.TeacherId);
                    var existingDto = new EnrollmentDTO
                    {
                        Id = existing.Id,
                        UserId = existing.UserId,
                        CourseId = existing.CourseId,
                        CourseTitle = course.Title,
                        CourseThumbnail = course.ThumbnailUrl,
                        CourseBannerUrl = course.ThumbnailUrl,
                        Instructor = existingTeacher != null ? (existingTeacher.FirstName + " " + existingTeacher.LastName) : null,
                        InstructorAvatar = existingTeacher?.ProfileImageUrl,
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

                // compute total lessons for the course (exclude preview parts)
                var totalLessons = await _context.CourseParts
                    .Where(p => p.CourseId == courseId)
                    .CountAsync();

                var enrollment = new Models.Enrollment
                {
                    UserId = userId,
                    CourseId = courseId,
                    EnrollmentType = "Student",
                    EnrolledAt = DateTime.UtcNow,
                    Status = "Active",
                    ProgressPercentage = 0,
                    TotalLessons = totalLessons,
                    CompletedLessons = 0
                };

                _context.Enrollments.Add(enrollment);
                course.EnrollmentCount += 1;
                _context.Courses.Update(course);

                await _context.SaveChangesAsync();

                // load teacher info to include in response
                var teacher = await _context.Users.FindAsync(course.TeacherId);

                var dto = new EnrollmentDTO
                {
                    Id = enrollment.Id,
                    UserId = enrollment.UserId,
                    CourseId = enrollment.CourseId,
                    CourseTitle = course.Title,
                    CourseThumbnail = course.ThumbnailUrl,
                    CourseBannerUrl = course.ThumbnailUrl,
                    Instructor = teacher != null ? (teacher.FirstName + " " + teacher.LastName) : null,
                    InstructorAvatar = teacher?.ProfileImageUrl,
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

                // Broadcast real-time update to course group and to the teacher (if hub available)
                try
                {
                    if (_hubContext != null)
                    {
                        var courseGroup = $"course-{courseId}";
                        await _hubContext.Clients.Group(courseGroup).SendAsync("StudentEnrolled", dto);

                        // Notify teacher-specific group `user-{teacherId}` so teacher UIs can react
                        var teacherGroup = $"user-{course.TeacherId}";
                        await _hubContext.Clients.Group(teacherGroup).SendAsync("StudentEnrolled", dto);
                    }
                }
                catch
                {
                    // Swallow hub exceptions — don't break enrollment on notification failure
                }

                return ServiceResult<EnrollmentDTO>.SuccessResult(dto);
            }
            catch (Exception ex)
            {
                return ServiceResult<EnrollmentDTO>.FailureResult($"Failed to enroll: {ex.Message}");
            }
        }

        public Task<ServiceResult<bool>> UnenrollFromCourse(int courseId, int userId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<EnrollmentDTO>> GetEnrollment(int enrollmentId)
            => Task.FromResult(ServiceResult<EnrollmentDTO>.FailureResult("Not implemented"));

        public async Task<ServiceResult<List<EnrollmentDTO>>> GetUserEnrollments(int userId, int page, int pageSize)
        {
            try
            {
                var query = _context.Enrollments
                    .Where(e => e.UserId == userId)
                    .OrderByDescending(e => e.EnrolledAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
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
                        EnrollmentType = e.EnrollmentType,
                        EnrolledAt = e.EnrolledAt,
                        CompletedAt = e.CompletedAt,
                        LastAccessed = e.LastAccessed,
                        ExpiryDate = e.ExpiryDate,
                        CompletedLessons = e.CompletedLessons,
                        TotalLessons = e.TotalLessons,
                        CourseTotalLessons = e.Course.TotalLessons,
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
                    .AsNoTracking();

                var list = await query.ToListAsync();

                // Post-process to fill missing totals and completed lessons for older enrollments
                foreach (var dto in list)
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

                // If CourseTotalLessons still missing (0), compute from CourseParts count per course
                var needsCount = list.Where(d => d.TotalLessons == 0 && d.CourseTotalLessons == 0).ToList();
                if (needsCount.Any())
                {
                    var courseIds = needsCount.Select(d => d.CourseId).Distinct().ToList();
                    var partsCounts = await _context.CourseParts
                        .Where(p => courseIds.Contains(p.CourseId))
                        .GroupBy(p => p.CourseId)
                        .Select(g => new { CourseId = g.Key, Count = g.Count() })
                        .ToListAsync();

                    foreach (var dto in needsCount)
                    {
                        var pc = partsCounts.FirstOrDefault(x => x.CourseId == dto.CourseId);
                        if (pc != null && pc.Count > 0)
                        {
                            dto.CourseTotalLessons = pc.Count;
                            dto.TotalLessons = pc.Count;

                            if (dto.CompletedLessons == 0 && dto.ProgressPercentage > 0)
                            {
                                try
                                {
                                    dto.CompletedLessons = (int)Math.Round((double)(dto.ProgressPercentage / 100m) * dto.TotalLessons);
                                }
                                catch { }
                            }
                        }
                    }
                }

                return ServiceResult<List<EnrollmentDTO>>.SuccessResult(list);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<EnrollmentDTO>>.FailureResult($"Failed to get enrollments: {ex.Message}");
            }
        }

        public Task<ServiceResult<List<EnrollmentDTO>>> GetCourseEnrollments(int courseId, int page, int pageSize)
            => Task.FromResult(ServiceResult<List<EnrollmentDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> UpdateEnrollmentProgress(int enrollmentId, UpdateProgressDTO dto)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<EnrollmentProgressDTO>> GetEnrollmentProgress(int enrollmentId, int userId)
            => Task.FromResult(ServiceResult<EnrollmentProgressDTO>.FailureResult("Not implemented"));

        public async Task<ServiceResult<bool>> CompleteLesson(int enrollmentId, int lessonId)
        {
            try
            {
                var enrollment = await _context.Enrollments.FindAsync(enrollmentId);
                if (enrollment == null) return ServiceResult<bool>.FailureResult("Enrollment not found");

                var lesson = await _context.Set<backend.Models.Lesson>().FindAsync(lessonId);
                if (lesson == null) return ServiceResult<bool>.FailureResult("Lesson not found");

                var lp = await _context.LessonProgresses
                    .FirstOrDefaultAsync(p => p.EnrollmentId == enrollmentId && p.LessonId == lessonId);

                if (lp == null)
                {
                    lp = new backend.Models.LessonProgress
                    {
                        EnrollmentId = enrollmentId,
                        LessonId = lessonId,
                        IsCompleted = true,
                        ProgressPercentage = 100.0,
                        TimeSpentMinutes = 0,
                        CompletedAt = DateTime.UtcNow
                    };
                    _context.LessonProgresses.Add(lp);

                    try { enrollment.CompletedLessons = (enrollment.CompletedLessons) + 1; } catch { }
                }
                else
                {
                    if (!lp.IsCompleted)
                    {
                        lp.IsCompleted = true;
                        lp.CompletedAt = DateTime.UtcNow;
                        lp.ProgressPercentage = Math.Max(lp.ProgressPercentage, 100.0);
                        try { enrollment.CompletedLessons = (enrollment.CompletedLessons) + 1; } catch { }
                    }
                }

                try
                {
                    if (enrollment.TotalLessons > 0)
                    {
                        enrollment.ProgressPercentage = (decimal)((double)enrollment.CompletedLessons / Math.Max(1, enrollment.TotalLessons) * 100.0);
                    }
                }
                catch { }

                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to complete lesson: {ex.Message}");
            }
        }

        public Task<ServiceResult<bool>> CompleteModule(int enrollmentId, int moduleId, int userId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> CompleteCourse(int enrollmentId, int userId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> SubmitAssignment(int enrollmentId, int assignmentId, SubmitAssignmentDTO dto)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> CompleteEnrollment(int enrollmentId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<EnrollmentStatsDTO>> GetEnrollmentStats(int userId)
            => Task.FromResult(ServiceResult<EnrollmentStatsDTO>.FailureResult("Not implemented"));

        public async Task<ServiceResult<CourseProgressDTO>> GetCourseProgress(int courseId, int userId)
        {
            try
            {
                var enrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);

                if (enrollment == null)
                    return ServiceResult<CourseProgressDTO>.FailureResult("Enrollment not found");

                // Determine total lessons: prefer enrollment.TotalLessons but fall back to course parts count
                var totalLessons = enrollment.TotalLessons;
                if (totalLessons <= 0)
                {
                    totalLessons = await _context.CourseParts
                        .Where(p => p.CourseId == courseId)
                        .CountAsync();
                }

                // Determine completed lessons: prefer enrollment.CompletedLessons, else count lesson progresses
                var completedLessons = enrollment.CompletedLessons;
                if (completedLessons <= 0)
                {
                    completedLessons = await _context.LessonProgresses
                        .Where(lp => lp.EnrollmentId == enrollment.Id && lp.IsCompleted)
                        .CountAsync();
                }

                // Percentage: prefer stored value, else compute
                float percentage = 0f;
                try
                {
                    if (enrollment.ProgressPercentage > 0)
                        percentage = (float)enrollment.ProgressPercentage;
                    else if (totalLessons > 0)
                        percentage = (float)(completedLessons * 100.0 / Math.Max(1, totalLessons));
                }
                catch { percentage = 0f; }

                // Last watched: most recent CompletedAt from LessonProgresses
                var last = await _context.LessonProgresses
                    .Where(lp => lp.EnrollmentId == enrollment.Id && lp.CompletedAt != null)
                    .OrderByDescending(lp => lp.CompletedAt)
                    .FirstOrDefaultAsync();

                var dto = new CourseProgressDTO
                {
                    TotalLessons = totalLessons,
                    CompletedLessons = completedLessons,
                    Percentage = percentage,
                    LastWatched = last?.CompletedAt,
                    OverallProgress = percentage
                };

                return ServiceResult<CourseProgressDTO>.SuccessResult(dto);
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseProgressDTO>.FailureResult($"Failed to get course progress: {ex.Message}");
            }
        }

        public Task<ServiceResult<List<StudentDTO>>> GetCourseStudents(int courseId, int page, int pageSize)
            => Task.FromResult(ServiceResult<List<StudentDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<StudentProgressDTO>> GetStudentProgress(int courseId, int studentId)
            => Task.FromResult(ServiceResult<StudentProgressDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<EnrollmentResponseDTO>>> GetActiveEnrollments(int userId)
            => Task.FromResult(ServiceResult<List<EnrollmentResponseDTO>>.FailureResult("Not implemented"));
    }
}
