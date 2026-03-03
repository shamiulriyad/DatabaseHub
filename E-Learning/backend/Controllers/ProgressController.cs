using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api")]
    public class ProgressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProgressController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int? GetCurrentUserId()
        {
            var id = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User?.FindFirst("userId")?.Value
                     ?? User?.FindFirst("id")?.Value
                     ?? User?.FindFirst("sub")?.Value;
            if (int.TryParse(id, out var userId)) return userId;
            return null;
        }

        [HttpPost("lesson/{lessonId}/watch")]
        [Authorize]
        public async Task<IActionResult> Watch(int lessonId, [FromBody] WatchRequestDTO dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var lesson = await _context.Lessons.Include(l => l.Module).ThenInclude(m => m.Course)
                .FirstOrDefaultAsync(l => l.Id == lessonId);
            if (lesson == null) return NotFound("Lesson not found");

            var progress = await _context.StudentLessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            if (progress == null)
            {
                progress = new StudentLessonProgress
                {
                    UserId = userId.Value,
                    LessonId = lessonId,
                    WatchedSeconds = dto.WatchedSeconds,
                    LastWatchedAt = DateTime.UtcNow
                };
                _context.StudentLessonProgresses.Add(progress);
            }
            else
            {
                // Keep the maximum watched seconds
                progress.WatchedSeconds = Math.Max(progress.WatchedSeconds, dto.WatchedSeconds);
                progress.LastWatchedAt = DateTime.UtcNow;
            }

            // Determine duration: prefer Lesson.Duration then Lesson.VideoDuration
            var duration = lesson.Duration ?? lesson.VideoDuration ?? 0;
            if (duration > 0)
            {
                var threshold = (int)Math.Ceiling(duration * 0.90);
                if (!progress.IsCompleted && progress.WatchedSeconds >= threshold)
                {
                    progress.IsCompleted = true;
                    progress.CompletedAt = DateTime.UtcNow;
                    lesson.CompletionCount += 1;
                }
            }

            await _context.SaveChangesAsync();

            // Update enrollment/course progress for this user
            if (lesson.Module?.CourseId != null)
            {
                await UpdateEnrollmentProgress(userId.Value, lesson.Module.CourseId);
            }

            return Ok(new { watchedSeconds = progress.WatchedSeconds, isCompleted = progress.IsCompleted });
        }

        [HttpPost("lesson/{lessonId}/complete")]
        [Authorize]
        public async Task<IActionResult> Complete(int lessonId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var lesson = await _context.Lessons.Include(l => l.Module).ThenInclude(m => m.Course)
                .FirstOrDefaultAsync(l => l.Id == lessonId);
            if (lesson == null) return NotFound("Lesson not found");

            var progress = await _context.StudentLessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            if (progress == null)
            {
                progress = new StudentLessonProgress
                {
                    UserId = userId.Value,
                    LessonId = lessonId,
                    WatchedSeconds = lesson.Duration ?? lesson.VideoDuration ?? 0,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow,
                    LastWatchedAt = DateTime.UtcNow
                };
                _context.StudentLessonProgresses.Add(progress);
            }
            else
            {
                progress.IsCompleted = true;
                progress.CompletedAt = DateTime.UtcNow;
                progress.WatchedSeconds = Math.Max(progress.WatchedSeconds, lesson.Duration ?? lesson.VideoDuration ?? progress.WatchedSeconds);
                progress.LastWatchedAt = DateTime.UtcNow;
            }

            lesson.CompletionCount += 1;
            await _context.SaveChangesAsync();

            if (lesson.Module?.CourseId != null)
            {
                await UpdateEnrollmentProgress(userId.Value, lesson.Module.CourseId);
            }

            return Ok(new { isCompleted = true });
        }

        [HttpGet("course/{courseId}/progress")]
        [Authorize]
        public async Task<IActionResult> GetCourseProgress(int courseId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            // Get lesson ids for the course
            var moduleIds = await _context.Modules.Where(m => m.CourseId == courseId).Select(m => m.Id).ToListAsync();
            var lessonIds = await _context.Lessons.Where(l => moduleIds.Contains(l.ModuleId)).Select(l => l.Id).ToListAsync();

            var total = lessonIds.Count;
            var completed = 0;
            if (total > 0)
            {
                completed = await _context.StudentLessonProgresses
                    .Where(p => p.UserId == userId && p.IsCompleted && lessonIds.Contains(p.LessonId))
                    .CountAsync();
            }

            var progressPercent = total == 0 ? 0 : (decimal)completed * 100m / total;

            var dto = new CourseProgressDTO
            {
                TotalLessons = total,
                CompletedLessons = completed,
                Percentage = (float)Math.Round(progressPercent, 2)
            };

            return Ok(dto);
        }

        [HttpGet("course/{courseId}/lesson-status")]
        [Authorize]
        public async Task<IActionResult> GetLessonStatus(int courseId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var moduleIds = await _context.Modules.Where(m => m.CourseId == courseId).Select(m => m.Id).ToListAsync();
            var lessons = await _context.Lessons
                .Where(l => moduleIds.Contains(l.ModuleId))
                .OrderBy(l => l.Order)
                .Select(l => new { l.Id, l.Title })
                .ToListAsync();

            var lessonIds = lessons.Select(l => l.Id).ToList();
            var progresses = await _context.StudentLessonProgresses
                .Where(p => p.UserId == userId && lessonIds.Contains(p.LessonId))
                .ToListAsync();

            var result = lessons.Select(l =>
            {
                var p = progresses.FirstOrDefault(x => x.LessonId == l.Id);
                return new LessonStatusDTO
                {
                    LessonId = l.Id,
                    Title = l.Title,
                    WatchedSeconds = p?.WatchedSeconds ?? 0,
                    IsCompleted = p?.IsCompleted ?? false,
                    CompletedAt = p?.CompletedAt
                };
            }).ToList();

            return Ok(result);
        }

        [HttpPost("course-part/{coursePartId}/watch")]
        [Authorize]
        public async Task<IActionResult> WatchCoursePart(int coursePartId, [FromBody] WatchRequestDTO dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var part = await _context.CourseParts.FirstOrDefaultAsync(p => p.Id == coursePartId);
            if (part == null) return NotFound("Course part not found");

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId.Value && e.CourseId == part.CourseId);
            if (enrollment == null) return BadRequest("Enrollment not found");

            var watchedSeconds = Math.Max(0, dto?.WatchedSeconds ?? 0);

            var progress = await _context.CoursePartProgresses
                .FirstOrDefaultAsync(p => p.EnrollmentId == enrollment.Id && p.CoursePartId == coursePartId);

            if (progress == null)
            {
                progress = new CoursePartProgress
                {
                    EnrollmentId = enrollment.Id,
                    CoursePartId = coursePartId,
                    IsCompleted = false,
                    ProgressPercentage = 0,
                    TimeSpentMinutes = 0
                };
                _context.CoursePartProgresses.Add(progress);
            }

            var effectiveDuration = part.DurationSeconds > 0 ? part.DurationSeconds : 300;
            var newPercent = Math.Min(100.0, (double)watchedSeconds / Math.Max(1, effectiveDuration) * 100.0);

            progress.ProgressPercentage = Math.Max(progress.ProgressPercentage, newPercent);
            progress.TimeSpentMinutes = Math.Max(progress.TimeSpentMinutes, (int)Math.Floor(watchedSeconds / 60.0));

            if (!progress.IsCompleted && progress.ProgressPercentage >= 90.0)
            {
                progress.IsCompleted = true;
                progress.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await UpdateCoursePartEnrollmentProgress(enrollment);

            return Ok(new
            {
                watchedSeconds,
                isCompleted = progress.IsCompleted,
                progressPercentage = Math.Round(progress.ProgressPercentage, 2),
                courseProgress = enrollment.ProgressPercentage
            });
        }

        [HttpPost("course-part/{coursePartId}/complete")]
        [Authorize]
        public async Task<IActionResult> CompleteCoursePart(int coursePartId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var part = await _context.CourseParts.FirstOrDefaultAsync(p => p.Id == coursePartId);
            if (part == null) return NotFound("Course part not found");

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId.Value && e.CourseId == part.CourseId);
            if (enrollment == null) return BadRequest("Enrollment not found");

            var progress = await _context.CoursePartProgresses
                .FirstOrDefaultAsync(p => p.EnrollmentId == enrollment.Id && p.CoursePartId == coursePartId);

            if (progress == null)
            {
                progress = new CoursePartProgress
                {
                    EnrollmentId = enrollment.Id,
                    CoursePartId = coursePartId,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow,
                    ProgressPercentage = 100.0,
                    TimeSpentMinutes = 0
                };
                _context.CoursePartProgresses.Add(progress);
            }
            else
            {
                progress.IsCompleted = true;
                progress.CompletedAt = progress.CompletedAt ?? DateTime.UtcNow;
                progress.ProgressPercentage = Math.Max(progress.ProgressPercentage, 100.0);
            }

            await _context.SaveChangesAsync();
            await UpdateCoursePartEnrollmentProgress(enrollment);

            return Ok(new { isCompleted = true, courseProgress = enrollment.ProgressPercentage });
        }

        [HttpGet("course/{courseId}/parts-progress")]
        [Authorize]
        public async Task<IActionResult> GetCoursePartsProgress(int courseId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId.Value && e.CourseId == courseId);
            if (enrollment == null) return NotFound("Enrollment not found");

            var parts = await _context.CourseParts
                .Where(p => p.CourseId == courseId)
                .OrderBy(p => p.Order)
                .Select(p => new { p.Id, p.Title })
                .ToListAsync();

            var progresses = await _context.CoursePartProgresses
                .Where(p => p.EnrollmentId == enrollment.Id)
                .ToListAsync();

            var result = parts.Select(p =>
            {
                var pp = progresses.FirstOrDefault(x => x.CoursePartId == p.Id);
                return new
                {
                    coursePartId = p.Id,
                    title = p.Title,
                    progressPercentage = Math.Round(pp?.ProgressPercentage ?? 0, 2),
                    isCompleted = pp?.IsCompleted ?? false,
                    timeSpentMinutes = pp?.TimeSpentMinutes ?? 0,
                    completedAt = pp?.CompletedAt
                };
            }).ToList();

            return Ok(new
            {
                totalParts = result.Count,
                completedParts = result.Count(x => x.isCompleted),
                parts = result,
                courseProgress = enrollment.ProgressPercentage
            });
        }

        // Helper: recompute and persist Enrollment.ProgressPercentage for a user-course
        private async Task UpdateEnrollmentProgress(int userId, int courseId)
        {
            var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);
            if (enrollment == null) return;

            var moduleIds = await _context.Modules.Where(m => m.CourseId == courseId).Select(m => m.Id).ToListAsync();
            var lessonIds = await _context.Lessons.Where(l => moduleIds.Contains(l.ModuleId)).Select(l => l.Id).ToListAsync();

            var total = lessonIds.Count;
            var completed = 0;
            if (total > 0)
            {
                completed = await _context.StudentLessonProgresses.Where(p => p.UserId == userId && p.IsCompleted && lessonIds.Contains(p.LessonId)).CountAsync();
            }

            enrollment.TotalLessons = total;
            enrollment.CompletedLessons = completed;
            enrollment.ProgressPercentage = total == 0 ? 0 : Math.Round((decimal)completed * 100m / total, 2);
            if (enrollment.ProgressPercentage >= 100)
            {
                enrollment.Status = "Completed";
                enrollment.CompletedAt = DateTime.UtcNow;
            }

            _context.Enrollments.Update(enrollment);
            await _context.SaveChangesAsync();
        }

        private async Task UpdateCoursePartEnrollmentProgress(Enrollment enrollment)
        {
            var totalParts = await _context.CourseParts
                .Where(p => p.CourseId == enrollment.CourseId)
                .CountAsync();

            var completedParts = 0;
            if (totalParts > 0)
            {
                completedParts = await _context.CoursePartProgresses
                    .Where(p => p.EnrollmentId == enrollment.Id && p.IsCompleted)
                    .CountAsync();
            }

            enrollment.TotalLessons = totalParts;
            enrollment.CompletedLessons = completedParts;
            enrollment.ProgressPercentage = totalParts == 0
                ? 0
                : Math.Round((decimal)completedParts * 100m / totalParts, 2);

            if (totalParts > 0 && completedParts >= totalParts)
            {
                enrollment.Status = "Completed";
                enrollment.CompletedAt ??= DateTime.UtcNow;
            }
            else if (enrollment.Status == "Completed")
            {
                enrollment.Status = "Active";
                enrollment.CompletedAt = null;
            }

            _context.Enrollments.Update(enrollment);
            await _context.SaveChangesAsync();
        }
    }
}
