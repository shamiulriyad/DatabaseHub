using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // TEACHER APPROVAL ENDPOINTS

        /// <summary>
        /// Get all pending teacher approvals
        /// </summary>
        [HttpGet("teacher-approvals/pending")]
        public async Task<IActionResult> GetPendingTeacherApprovals(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _adminService.GetPendingTeacherApprovals(page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = result.Message,
                data = result.Data
            });
        }

        /// <summary>
        /// Get count of pending teacher approvals
        /// </summary>
        [HttpGet("teacher-approvals/count")]
        public async Task<IActionResult> GetPendingTeacherApprovalsCount()
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _adminService.GetPendingTeacherApprovalsCount();
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = result.Message,
                count = result.Data
            });
        }

        /// <summary>
        /// Approve a teacher request
        /// </summary>
        [HttpPost("teacher-approvals/{userId}/approve")]
        public async Task<IActionResult> ApproveTeacherRequest(int userId)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _adminService.ApproveTeacherRequest(userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Teacher request approved successfully",
                user = result.Data
            });
        }

        /// <summary>
        /// Reject a teacher request
        /// </summary>
        [HttpPost("teacher-approvals/{userId}/reject")]
        public async Task<IActionResult> RejectTeacherRequest(
            int userId,
            [FromBody] RejectTeacherRequestDTO rejectDto)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _adminService.RejectTeacherRequest(userId, rejectDto?.Reason ?? "");
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Teacher request rejected successfully"
            });
        }

        // EXISTING ADMIN ENDPOINTS

        [HttpGet("stats")]
        public async Task<IActionResult> GetPlatformStats()
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _adminService.GetPlatformStats();
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                stats = result.Data
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? role = null,
            [FromQuery] string? status = null)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var filterDto = new UserFilterDTO();
            var result = await _adminService.GetAllUsers(filterDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                users = result.Data
            });
        }

        [HttpPut("users/{userId}/role")]
        public async Task<IActionResult> UpdateUserRole(int userId, [FromBody] UpdateUserRoleDTO roleDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _adminService.UpdateUserRole(userId, roleDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "User role updated successfully",
                user = result.Data
            });
        }

        [HttpGet("courses/pending")]
        public async Task<IActionResult> GetPendingCourses(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var filterDto = new CourseApprovalFilterDTO { Status = "Pending" };
            var result = await _adminService.GetPendingCourses(filterDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data
            });
        }

        [HttpPost("courses/{courseId}/approve")]
        public async Task<IActionResult> ApproveCourse(int courseId, [FromBody] ApproveCourseDTO approveDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _adminService.ApproveCourse(courseId, approveDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Course approved successfully"
            });
        }

        [HttpPost("courses/{courseId}/reject")]
        public async Task<IActionResult> RejectCourse(int courseId, [FromBody] RejectCourseDTO rejectDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _adminService.RejectCourse(courseId, rejectDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Course rejected successfully"
            });
        }
    }
}
