using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CoursesController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCourses(
            [FromQuery] string? search = null,
            [FromQuery] int? universityId = null,
            [FromQuery] int? departmentId = null,
            [FromQuery] string? difficulty = null,
            [FromQuery] bool? isFree = null,
            [FromQuery] string? status = "Approved",
            [FromQuery] string? sortBy = "newest",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _courseService.GetAllCourses(
                search, universityId, departmentId, difficulty, isFree, 
                status, sortBy, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data.Items,
                totalCount = result.Data.TotalCount,
                page = result.Data.PageNumber,
                pageSize = result.Data.PageSize,
                totalPages = result.Data.TotalPages
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourse(int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            int? parsedUserId = userId != null ? int.Parse(userId) : null;

            var result = await _courseService.GetCourseById(id, parsedUserId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                course = result.Data
            });
        }

        [HttpGet("university/{universityId}")]
        public async Task<IActionResult> GetCoursesByUniversity(int universityId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _courseService.GetCoursesByUniversity(universityId, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data.Items,
                totalCount = result.Data.TotalCount,
                page = result.Data.PageNumber,
                pageSize = result.Data.PageSize,
                totalPages = result.Data.TotalPages
            });
        }

        [HttpGet("department/{departmentId}")]
        public async Task<IActionResult> GetCoursesByDepartment(int departmentId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _courseService.GetCoursesByDepartment(departmentId, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data.Items,
                totalCount = result.Data.TotalCount,
                page = result.Data.PageNumber,
                pageSize = result.Data.PageSize,
                totalPages = result.Data.TotalPages
            });
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularCourses()
        {
            var result = await _courseService.GetPopularCourses();
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data
            });
        }

        [HttpGet("trending")]
        public async Task<IActionResult> GetTrendingCourses()
        {
            var result = await _courseService.GetTrendingCourses();
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data
            });
        }

        [HttpGet("new")]
        public async Task<IActionResult> GetNewCourses()
        {
            var result = await _courseService.GetNewCourses();
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data
            });
        }

        [HttpGet("teacher/{teacherId}")]
        public async Task<IActionResult> GetCoursesByTeacher(int teacherId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _courseService.GetCoursesByTeacher(teacherId, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data.Items,
                totalCount = result.Data.TotalCount,
                page = result.Data.PageNumber,
                pageSize = result.Data.PageSize,
                totalPages = result.Data.TotalPages
            });
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost]
        public async Task<IActionResult> CreateCourse([FromBody] CourseCreateDTO courseDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(courseDto.PreviewVideoUrl))
                return BadRequest(new { success = false, message = "Preview video or YouTube URL is required when creating a course." });

            var teacherId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _courseService.CreateCourse(courseDto, teacherId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return CreatedAtAction(nameof(GetCourse), new { id = result.Data.Id }, new {
                success = true,
                message = "Course created successfully. Waiting for admin approval.",
                course = result.Data
            });
        }

        [Authorize(Roles = "Teacher,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] CourseUpdateDTO courseDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            
            var result = await _courseService.UpdateCourse(id, userId, userRole, courseDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Course updated successfully",
                course = result.Data
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateCourseStatus(int id, [FromBody] UpdateCourseStatusDTO statusDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _courseService.UpdateCourseStatus(id, adminId, statusDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = $"Course {statusDto.Status.ToLower()} successfully",
                course = result.Data
            });
        }

        [Authorize]
        [HttpPost("{courseId}/enroll")]
        public async Task<IActionResult> EnrollInCourse(int courseId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _courseService.EnrollInCourse(userId, courseId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { 
                success = true,
                message = "Successfully enrolled in course",
                enrollment = result.Data
            });
        }

        [Authorize]
        [HttpGet("my-courses")]
        public async Task<IActionResult> GetMyCourses(
            [FromQuery] string? status = null, // Active, Completed, etc.
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _courseService.GetUserEnrolledCourses(userId, status, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data.Items,
                totalCount = result.Data.TotalCount,
                page = result.Data.PageNumber,
                pageSize = result.Data.PageSize,
                totalPages = result.Data.TotalPages
            });
        }

        [Authorize]
        [HttpGet("created-courses")]
        public async Task<IActionResult> GetCreatedCourses(
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _courseService.GetUserCreatedCourses(userId, status, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data.Items,
                totalCount = result.Data.TotalCount,
                page = result.Data.PageNumber,
                pageSize = result.Data.PageSize,
                totalPages = result.Data.TotalPages
            });
        }

        [HttpGet("{courseId}/modules")]
        public async Task<IActionResult> GetCourseModules(int courseId)
        {
            var result = await _courseService.GetCourseModules(courseId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                modules = result.Data
            });
        }

        [HttpGet("{courseId}/reviews")]
        public async Task<IActionResult> GetCourseReviews(int courseId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _courseService.GetCourseReviews(courseId, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                reviews = result.Data.Items,
                totalCount = result.Data.TotalCount,
                averageRating = result.Data.PageNumber,
                page = result.Data.PageNumber,
                pageSize = result.Data.PageSize,
                totalPages = result.Data.TotalPages
            });
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchCourses(
            [FromQuery] string query,
            [FromQuery] int? universityId = null,
            [FromQuery] int? departmentId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { success = false, message = "Search query is required" });

            var result = await _courseService.SearchCourses(query, universityId, departmentId, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data.Items,
                totalCount = result.Data.TotalCount,
                page = result.Data.PageNumber,
                pageSize = result.Data.PageSize,
                totalPages = result.Data.TotalPages
            });
        }

        [HttpGet("filter")]
        public async Task<IActionResult> FilterCourses(
            [FromQuery] CourseFilterDTO filter,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _courseService.FilterCourses(filter, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data.Items,
                totalCount = result.Data.TotalCount,
                page = result.Data.PageNumber,
                pageSize = result.Data.PageSize,
                totalPages = result.Data.TotalPages
            });
        }

        [Authorize(Roles = "Teacher,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            
            var result = await _courseService.DeleteCourse(id, userId, userRole);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Course deleted successfully"
            });
        }

        [HttpGet("{id}/stats")]
        public async Task<IActionResult> GetCourseStats(int id)
        {
            var result = await _courseService.GetCourseStats(id);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                stats = result.Data
            });
        }
    }
}