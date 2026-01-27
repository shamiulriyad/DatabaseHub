using backend.DTOs;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LearningController : ControllerBase
    {
        private readonly ILearningService _learningService;

        public LearningController(ILearningService learningService)
        {
            _learningService = learningService;
        }

        [HttpGet("course/{courseId}/content")]
        public async Task<IActionResult> GetCourseContent(int courseId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.GetCourseContent(courseId, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                content = result.Data
            });
        }

        [HttpGet("module/{moduleId}")]
        public async Task<IActionResult> GetModuleContent(int moduleId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.GetModuleContent(moduleId, userId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                module = result.Data
            });
        }

        [HttpGet("lesson/{lessonId}")]
        public async Task<IActionResult> GetLesson(int lessonId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.GetLesson(lessonId, userId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                lesson = result.Data
            });
        }

        [HttpPost("lesson/{lessonId}/complete")]
        public async Task<IActionResult> MarkLessonComplete(int lessonId, [FromQuery] int enrollmentId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.MarkLessonComplete(lessonId, userId, enrollmentId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Lesson marked as completed",
                completed = result.Data
            });
        }

        [HttpPost("lesson/{lessonId}/watch")]
        public async Task<IActionResult> WatchLesson(int lessonId, [FromQuery] int enrollmentId, [FromBody] WatchDTO watch)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            if (watch == null)
                return BadRequest(new { success = false, message = "Missing watch payload" });

            var result = await _learningService.UpdateLessonWatch(lessonId, userId, enrollmentId, watch.WatchedSeconds);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = "Watch progress saved" });
        }

        // QUIZ ENDPOINTS

        [HttpGet("quiz/{quizId}")]
        public async Task<IActionResult> GetQuiz(int quizId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.GetQuiz(quizId, userId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                quiz = result.Data
            });
        }

        [HttpPost("quiz/{quizId}/start")]
        public async Task<IActionResult> StartQuiz(int quizId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.StartQuiz(quizId, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Quiz started",
                quizSession = result.Data
            });
        }

        [HttpPost("quiz/{quizId}/submit")]
        public async Task<IActionResult> SubmitQuiz(int quizId, [FromBody] SubmitQuizDTO quizDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.SubmitQuiz(quizId, userId, quizDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Quiz submitted successfully",
                result = result.Data
            });
        }

        [HttpGet("quiz/{quizId}/results")]
        public async Task<IActionResult> GetQuizResults(int quizId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.GetQuizResults(quizId, userId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                results = result.Data
            });
        }

        // ASSIGNMENT ENDPOINTS

        [HttpGet("assignment/{assignmentId}")]
        public async Task<IActionResult> GetAssignment(int assignmentId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.GetAssignment(assignmentId, userId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                assignment = result.Data
            });
        }

        [HttpPost("assignment/{assignmentId}/submit")]
        public async Task<IActionResult> SubmitAssignment(int assignmentId, [FromBody] SubmitAssignmentDTO assignmentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.SubmitAssignment(assignmentId, userId, assignmentDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Assignment submitted successfully",
                submission = result.Data
            });
        }

        // Teacher-facing submission endpoints removed.

        // NOTES & BOOKMARKS

        [HttpPost("lesson/{lessonId}/note")]
        public async Task<IActionResult> AddNote(int lessonId, [FromBody] CreateNoteDTO noteDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.AddNote(lessonId, userId, noteDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Note added successfully",
                note = result.Data
            });
        }

        [HttpGet("course/{courseId}/notes")]
        public async Task<IActionResult> GetCourseNotes(int courseId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.GetCourseNotes(courseId, userId);
            
            return Ok(new {
                success = true,
                notes = result.Data
            });
        }

        [HttpPost("lesson/{lessonId}/bookmark")]
        public async Task<IActionResult> BookmarkLesson(int lessonId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.BookmarkLesson(lessonId, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Lesson bookmarked",
                bookmarked = result.Data
            });
        }

        [HttpGet("bookmarks")]
        public async Task<IActionResult> GetBookmarks()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.GetBookmarks(userId);
            
            return Ok(new {
                success = true,
                bookmarks = result.Data
            });
        }

        // LEARNING ANALYTICS

        [HttpGet("analytics/daily")]
        public async Task<IActionResult> GetDailyAnalytics([FromQuery] DateTime? date = null)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var targetDate = date?.Date ?? DateTime.UtcNow.Date;
            var result = await _learningService.GetDailyAnalytics(userId, targetDate);
            
            return Ok(new {
                success = true,
                analytics = result.Data
            });
        }

        [HttpGet("analytics/weekly")]
        public async Task<IActionResult> GetWeeklyAnalytics([FromQuery] DateTime? startDate = null)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var start = (startDate?.Date) ?? GetStartOfWeek(DateTime.UtcNow.Date);
            var result = await _learningService.GetWeeklyAnalytics(userId, start);
            
            return Ok(new {
                success = true,
                analytics = result.Data
            });
        }

        private static DateTime GetStartOfWeek(DateTime date)
        {
            // Assuming week starts on Monday
            int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-diff).Date;
        }

        [HttpGet("analytics/course/{courseId}")]
        public async Task<IActionResult> GetCourseAnalytics(int courseId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _learningService.GetCourseAnalytics(courseId, userId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                analytics = result.Data
            });
        }
    }
}