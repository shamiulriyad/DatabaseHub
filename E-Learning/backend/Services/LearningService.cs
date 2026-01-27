using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class LearningService : ILearningService
    {
        private readonly ApplicationDbContext _context;

        public LearningService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Course Content
        public Task<ServiceResult<CourseContentDTO>> GetCourseContent(int courseId, int userId)
            => Task.FromResult(ServiceResult<CourseContentDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<ModuleContentDTO>> GetModuleContent(int moduleId, int userId)
            => Task.FromResult(ServiceResult<ModuleContentDTO>.FailureResult("Not implemented"));

        // Lesson Operations
        public Task<ServiceResult<LessonDTO>> CreateLesson(int courseId, CreateLessonDTO dto, int teacherId)
            => Task.FromResult(ServiceResult<LessonDTO>.FailureResult("Not implemented"));

        public async Task<ServiceResult<LessonDTO>> GetLesson(int lessonId, int userId)
        {
            try
            {
                // Try to find Lesson by id
                var lesson = await _context.Set<backend.Models.Lesson>()
                    .FirstOrDefaultAsync(l => l.Id == lessonId);

                // If not found, try to interpret the id as a legacy CoursePart id and map it
                if (lesson == null)
                {
                    var part = await _context.CourseParts.FindAsync(lessonId);
                    if (part == null) return ServiceResult<LessonDTO>.FailureResult("Lesson not found");
                    lesson = await CreateOrGetLessonFromPart(part);
                }

                if (lesson == null) return ServiceResult<LessonDTO>.FailureResult("Lesson not found");

                var dto = new LessonDTO
                {
                    Id = lesson.Id,
                    Title = lesson.Title,
                    Content = lesson.Content,
                    ModuleId = lesson.ModuleId,
                    Order = lesson.Order,
                    ContentType = lesson.ContentType,
                    VideoUrl = lesson.VideoUrl,
                    PdfUrl = lesson.PdfUrl,
                    SlidesUrl = lesson.SlidesUrl,
                    ExternalLink = lesson.ExternalLink,
                    VideoDuration = lesson.VideoDuration,
                    VideoProvider = lesson.VideoProvider,
                    IsPreview = lesson.IsPreview,
                    IsRequired = lesson.IsRequired,
                    CompletionPoints = lesson.CompletionPoints,
                    IsImportantForExam = lesson.IsImportantForExam,
                    ExamNotes = lesson.ExamNotes,
                    Attachments = string.IsNullOrEmpty(lesson.Attachments) ? new List<string>() : System.Text.Json.JsonSerializer.Deserialize<List<string>>(lesson.Attachments),
                    References = string.IsNullOrEmpty(lesson.References) ? new List<string>() : System.Text.Json.JsonSerializer.Deserialize<List<string>>(lesson.References),
                    ViewCount = lesson.ViewCount,
                    CompletionCount = lesson.CompletionCount,
                    IsCompleted = false,
                    CompletedAt = null,
                    CreatedAt = lesson.CreatedAt,
                    UpdatedAt = lesson.UpdatedAt,
                    HasNextLesson = false,
                    HasPreviousLesson = false,
                    NextLessonId = null,
                    PreviousLessonId = null,
                    NextLessonTitle = null,
                    PreviousLessonTitle = null
                };

                // Populate next / previous lesson info based on module ordering
                try
                {
                    var moduleLessons = await _context.Lessons
                        .Where(l => l.ModuleId == lesson.ModuleId)
                        .OrderBy(l => l.Order)
                        .ThenBy(l => l.Id)
                        .Select(l => new { l.Id, l.Title })
                        .ToListAsync();

                    if (moduleLessons != null && moduleLessons.Count > 0)
                    {
                        var idx = moduleLessons.FindIndex(x => x.Id == lesson.Id);
                        if (idx >= 0)
                        {
                            if (idx + 1 < moduleLessons.Count)
                            {
                                dto.HasNextLesson = true;
                                dto.NextLessonId = moduleLessons[idx + 1].Id;
                                dto.NextLessonTitle = moduleLessons[idx + 1].Title;
                            }
                            if (idx - 1 >= 0)
                            {
                                dto.HasPreviousLesson = true;
                                dto.PreviousLessonId = moduleLessons[idx - 1].Id;
                                dto.PreviousLessonTitle = moduleLessons[idx - 1].Title;
                            }
                        }
                    }
                }
                catch
                {
                    // Non-fatal: if something goes wrong computing neighbors, leave defaults
                }

                // Populate enrollment context for the requesting user so frontend can send enrollmentId
                try
                {
                    var module = await _context.Modules.FirstOrDefaultAsync(m => m.Id == lesson.ModuleId);
                    if (module != null)
                    {
                        var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.CourseId == module.CourseId && e.UserId == userId);
                        if (enrollment != null)
                        {
                            dto.EnrollmentId = enrollment.Id;
                            dto.CourseProgress = (double)enrollment.ProgressPercentage;

                            // If there is a LessonProgress record showing completion for this enrollment, reflect it
                            var lp = await _context.LessonProgresses.FirstOrDefaultAsync(p => p.EnrollmentId == enrollment.Id && p.LessonId == lesson.Id && p.IsCompleted);
                            if (lp != null)
                            {
                                dto.IsCompleted = true;
                                dto.CompletedAt = lp.CompletedAt;
                            }
                        }
                    }
                }
                catch
                {
                    // ignore enrollment lookup failures
                }

                return ServiceResult<LessonDTO>.SuccessResult(dto);
            }
            catch (Exception ex)
            {
                return ServiceResult<LessonDTO>.FailureResult($"Failed to get lesson: {ex.Message}");
            }
        }

        public Task<ServiceResult<LessonDTO>> GetLessonById(int lessonId)
            => Task.FromResult(ServiceResult<LessonDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<LessonDTO>>> GetCourseLessons(int courseId)
            => Task.FromResult(ServiceResult<List<LessonDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<LessonDTO>> UpdateLesson(int lessonId, UpdateLessonDTO dto)
            => Task.FromResult(ServiceResult<LessonDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> DeleteLesson(int lessonId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        // Map legacy CoursePart to Lesson: create a Module (if needed) and a Lesson entry
        private async Task<backend.Models.Lesson> CreateOrGetLessonFromPart(backend.Models.CoursePart part)
        {
            // Find or create a special module to hold legacy course parts
            var module = await _context.Modules.FirstOrDefaultAsync(m => m.CourseId == part.CourseId && m.Title == "Legacy Course Parts");
            if (module == null)
            {
                module = new backend.Models.Module
                {
                    CourseId = part.CourseId,
                    Title = "Legacy Course Parts",
                    Description = "Auto-created module for legacy CourseParts",
                    Order = 0
                };
                _context.Modules.Add(module);
                await _context.SaveChangesAsync();
            }

            // Try to find an existing lesson mapped to this part
            var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.ModuleId == module.Id && l.Title == part.Title);
            if (lesson != null) return lesson;

            // Create a lesson from the course part
            lesson = new backend.Models.Lesson
            {
                ModuleId = module.Id,
                Title = part.Title,
                Content = part.Description,
                Order = part.Order,
                ContentType = (!string.IsNullOrEmpty(part.VideoUrl) || !string.IsNullOrEmpty(part.YouTubeUrl)) ? "Video" : "Text",
                VideoUrl = !string.IsNullOrEmpty(part.VideoUrl) ? part.VideoUrl : part.YouTubeUrl,
                VideoProvider = !string.IsNullOrEmpty(part.YouTubeUrl) ? "YouTube" : null,
                IsPreview = part.IsPreview
            };

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();
            return lesson;
        }

        public async Task<ServiceResult<bool>> MarkLessonComplete(int lessonId, int userId, int enrollmentId)
        {
            try
            {
                var lesson = await _context.Set<backend.Models.Lesson>().FindAsync(lessonId);

                // If Lesson not found, try CoursePart and map it to a Lesson (compatibility)
                if (lesson == null)
                {
                    var part = await _context.CourseParts.FindAsync(lessonId);
                    if (part == null) return ServiceResult<bool>.FailureResult("Lesson not found");

                    lesson = await CreateOrGetLessonFromPart(part);
                }

                var enrollment = await _context.Enrollments.FindAsync(enrollmentId);
                if (enrollment == null) return ServiceResult<bool>.FailureResult("Enrollment not found");
                if (enrollment.UserId != userId) return ServiceResult<bool>.FailureResult("Unauthorized");
                if (lesson != null)
                {
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
                }
                // CoursePart cases are mapped to Lesson earlier; no separate CoursePartProgress needed here

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
                return ServiceResult<bool>.FailureResult($"Failed to mark lesson complete: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> UpdateLessonWatch(int lessonId, int userId, int enrollmentId, int watchedSeconds)
        {
            try
            {
                var lesson = await _context.Set<backend.Models.Lesson>().FindAsync(lessonId);

                // If Lesson not found, try CoursePart and map to Lesson
                if (lesson == null)
                {
                    var part = await _context.CourseParts.FindAsync(lessonId);
                    if (part == null) return ServiceResult<bool>.FailureResult("Lesson not found");

                    lesson = await CreateOrGetLessonFromPart(part);
                }

                var enrollment = await _context.Enrollments.FindAsync(enrollmentId);
                if (enrollment == null) return ServiceResult<bool>.FailureResult("Enrollment not found");
                if (enrollment.UserId != userId) return ServiceResult<bool>.FailureResult("Unauthorized");
                if (lesson != null)
                {
                    var localLp = await _context.LessonProgresses
                        .FirstOrDefaultAsync(p => p.EnrollmentId == enrollmentId && p.LessonId == lessonId);

                    if (localLp == null)
                    {
                        localLp = new backend.Models.LessonProgress
                        {
                            EnrollmentId = enrollmentId,
                            LessonId = lessonId,
                            IsCompleted = false,
                            ProgressPercentage = 0,
                            TimeSpentMinutes = 0
                        };
                        _context.LessonProgresses.Add(localLp);
                    }

                    // Compute progress based on lesson.VideoDuration (seconds).
                    // If VideoDuration is missing (e.g., YouTube links), use a sensible fallback (5 minutes = 300s).
                    double localNewPercent = localLp.ProgressPercentage;
                    var effectiveDuration = (lesson.VideoDuration.HasValue && lesson.VideoDuration.Value > 0) ? lesson.VideoDuration.Value : 300;
                    localNewPercent = Math.Min(100.0, (double)watchedSeconds / effectiveDuration * 100.0);

                    // Update time spent (minutes) and progress (use max to avoid regress)
                    localLp.TimeSpentMinutes = Math.Max(localLp.TimeSpentMinutes, (int)Math.Floor(watchedSeconds / 60.0));
                    localLp.ProgressPercentage = Math.Max(localLp.ProgressPercentage, localNewPercent);

                    // Auto-complete at >= 90%
                    if (!localLp.IsCompleted && localLp.ProgressPercentage >= 90.0)
                    {
                        localLp.IsCompleted = true;
                        localLp.CompletedAt = DateTime.UtcNow;

                        // Increment enrollment completed lessons if tracking exists
                        try
                        {
                            enrollment.CompletedLessons = (enrollment.CompletedLessons) + 1;
                        }
                        catch { }
                    }
                }
                // Now lesson is guaranteed; update LessonProgress accordingly
                var lp = await _context.LessonProgresses
                    .FirstOrDefaultAsync(p => p.EnrollmentId == enrollmentId && p.LessonId == lesson.Id);

                if (lp == null)
                {
                    lp = new backend.Models.LessonProgress
                    {
                        EnrollmentId = enrollmentId,
                        LessonId = lesson.Id,
                        IsCompleted = false,
                        ProgressPercentage = 0,
                        TimeSpentMinutes = 0
                    };
                    _context.LessonProgresses.Add(lp);
                }

                // Compute progress based on lesson.VideoDuration (seconds) with fallback for missing durations
                double newPercent = lp.ProgressPercentage;
                var effectiveDuration2 = (lesson.VideoDuration.HasValue && lesson.VideoDuration.Value > 0) ? lesson.VideoDuration.Value : 300;
                newPercent = Math.Min(100.0, (double)watchedSeconds / effectiveDuration2 * 100.0);

                // Update time spent (minutes) and progress (use max to avoid regress)
                lp.TimeSpentMinutes = Math.Max(lp.TimeSpentMinutes, (int)Math.Floor(watchedSeconds / 60.0));
                lp.ProgressPercentage = Math.Max(lp.ProgressPercentage, newPercent);

                // Auto-complete at >= 90%
                if (!lp.IsCompleted && lp.ProgressPercentage >= 90.0)
                {
                    lp.IsCompleted = true;
                    lp.CompletedAt = DateTime.UtcNow;

                    try { enrollment.CompletedLessons = (enrollment.CompletedLessons) + 1; } catch { }
                }

                // Update enrollment overall progress percentage if total lessons known
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
                return ServiceResult<bool>.FailureResult($"Failed to update watch progress: {ex.Message}");
            }
        }

        public Task<ServiceResult<bool>> BookmarkLesson(int lessonId, int userId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<LessonDTO>>> GetBookmarks(int userId)
            => Task.FromResult(ServiceResult<List<LessonDTO>>.FailureResult("Not implemented"));

        // Assignment Operations
        public Task<ServiceResult<AssignmentDTO>> CreateAssignment(int courseId, CreateAssignmentDTO dto, int teacherId)
            => Task.FromResult(ServiceResult<AssignmentDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<AssignmentDTO>> GetAssignment(int assignmentId, int userId)
            => Task.FromResult(ServiceResult<AssignmentDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<AssignmentDTO>> GetAssignmentById(int assignmentId)
            => Task.FromResult(ServiceResult<AssignmentDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<AssignmentDTO>>> GetCourseAssignments(int courseId)
            => Task.FromResult(ServiceResult<List<AssignmentDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<AssignmentDTO>> UpdateAssignment(int assignmentId, UpdateAssignmentDTO dto)
            => Task.FromResult(ServiceResult<AssignmentDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> DeleteAssignment(int assignmentId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<AssignmentSubmissionDTO>> SubmitAssignment(int assignmentId, int userId, SubmitAssignmentDTO dto)
            => Task.FromResult(ServiceResult<AssignmentSubmissionDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<AssignmentSubmissionDTO>>> GetAssignmentSubmissions(int assignmentId, int teacherId)
            => Task.FromResult(ServiceResult<List<AssignmentSubmissionDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> GradeAssignment(int submissionId, int teacherId, GradeAssignmentDTO dto)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        // Quiz Operations
        public Task<ServiceResult<QuizDTO>> CreateQuiz(int courseId, CreateQuizDTO dto, int teacherId)
            => Task.FromResult(ServiceResult<QuizDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<QuizDTO>> GetQuiz(int quizId, int userId)
            => Task.FromResult(ServiceResult<QuizDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<QuizDTO>> GetQuizById(int quizId)
            => Task.FromResult(ServiceResult<QuizDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<QuizDTO>>> GetCourseQuizzes(int courseId)
            => Task.FromResult(ServiceResult<List<QuizDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<QuizDTO>> UpdateQuiz(int quizId, UpdateQuizDTO dto)
            => Task.FromResult(ServiceResult<QuizDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> DeleteQuiz(int quizId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<QuizAttemptDTO>> StartQuiz(int quizId, int userId)
            => Task.FromResult(ServiceResult<QuizAttemptDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<QuizResultDTO>> SubmitQuiz(int quizId, int userId, SubmitQuizDTO dto)
            => Task.FromResult(ServiceResult<QuizResultDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<QuizResultDTO>> GetQuizResults(int attemptId, int userId)
            => Task.FromResult(ServiceResult<QuizResultDTO>.FailureResult("Not implemented"));

        // Notes Operations
        public Task<ServiceResult<NoteDTO>> AddNote(int lessonId, int userId, CreateNoteDTO dto)
            => Task.FromResult(ServiceResult<NoteDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<NoteDTO>>> GetCourseNotes(int courseId, int userId)
            => Task.FromResult(ServiceResult<List<NoteDTO>>.FailureResult("Not implemented"));

        // Analytics Operations
        public Task<ServiceResult<DailyAnalyticsDTO>> GetDailyAnalytics(int userId, DateTime date)
            => Task.FromResult(ServiceResult<DailyAnalyticsDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<WeeklyAnalyticsDTO>> GetWeeklyAnalytics(int userId, DateTime startDate)
            => Task.FromResult(ServiceResult<WeeklyAnalyticsDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<CourseAnalyticsDTO>> GetCourseAnalytics(int courseId, int teacherId)
            => Task.FromResult(ServiceResult<CourseAnalyticsDTO>.FailureResult("Not implemented"));
    }
}

