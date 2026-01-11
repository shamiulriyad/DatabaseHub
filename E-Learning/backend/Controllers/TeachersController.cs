using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;
using backend.Services.Interfaces;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeachersController : ControllerBase
    {
        private readonly ITeacherService _teacherService;

        public TeachersController(ITeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        /// <summary>
        /// Apply to become a teacher
        /// </summary>
        [Authorize]
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyToBeTeacher([FromBody] ApplyTeacherDTO applyDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null)
                return Unauthorized(new { success = false, message = "Invalid token" });

            if (!int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { success = false, message = "Invalid user ID" });

            var result = await _teacherService.ApplyToBeTeacher(userId, applyDto);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new
            {
                success = true,
                message = result.Message,
                application = result.Data
            });
        }

        /// <summary>
        /// Get user's teacher application status
        /// </summary>
        [Authorize]
        [HttpGet("my-application")]
        public async Task<IActionResult> GetMyApplicationStatus()
        {
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null)
                return Unauthorized(new { success = false, message = "Invalid token" });

            if (!int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { success = false, message = "Invalid user ID" });

            var result = await _teacherService.GetMyApplicationStatus(userId);

            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new
            {
                success = true,
                application = result.Data
            });
        }

        /// <summary>
        /// Check if user has pending application
        /// </summary>
        [Authorize]
        [HttpGet("has-pending-application")]
        public async Task<IActionResult> HasPendingApplication()
        {
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null)
                return Unauthorized(new { success = false, message = "Invalid token" });

            if (!int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { success = false, message = "Invalid user ID" });

            var result = await _teacherService.HasPendingApplication(userId);

            return Ok(new
            {
                success = result.Success,
                hasPending = result.Data
            });
        }

        // ==================== ADMIN ENDPOINTS ====================

        /// <summary>
        /// Debug endpoint - Show JWT claims (Admin only)
        /// </summary>
        [Authorize]
        [HttpGet("debug/claims")]
        public IActionResult GetDebugClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(new
            {
                success = true,
                message = "Your JWT claims:",
                claims = claims
            });
        }

        /// <summary>
        /// Get all teacher applications (Admin only)
        /// </summary>
        [Authorize]
        [HttpGet("applications")]
        public async Task<IActionResult> GetAllApplications([FromQuery] string? status = null)
        {
            // Get user ID from token
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { success = false, message = "Invalid token" });

            // Check if user is admin (from JWT claim OR from database)
            var isAdminClaim = User.FindFirst(ClaimTypes.Role)?.Value == "Admin";
            
            // If not in JWT claim, check database as fallback
            bool isAdminInDb = false;
            if (!isAdminClaim)
            {
                var user = await _teacherService.GetUserById(userId);
                isAdminInDb = user?.IsAdmin ?? false;
            }

            if (!isAdminClaim && !isAdminInDb)
                return BadRequest(new { success = false, message = "Admin role required. Please ensure your account has admin privileges and log out/in again." });

            var result = await _teacherService.GetAllApplications(status);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new
            {
                success = true,
                count = result.Data?.Count ?? 0,
                applications = result.Data
            });
        }

        /// <summary>
        /// Get single application details (Admin only)
        /// </summary>
        [Authorize]
        [HttpGet("applications/{applicationId}")]
        public async Task<IActionResult> GetApplicationDetails(int applicationId)
        {
            var isAdminClaim = User.FindFirst(ClaimTypes.Role);
            if (isAdminClaim?.Value != "Admin")
                return Forbid();

            var result = await _teacherService.GetApplicationDetails(applicationId);

            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new
            {
                success = true,
                application = result.Data
            });
        }

        /// <summary>
        /// Review teacher application (Admin only)
        /// </summary>
        [Authorize]
        [HttpPost("applications/{applicationId}/review")]
        public async Task<IActionResult> ReviewApplication(int applicationId, [FromBody] ReviewTeacherApplicationDTO reviewDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int adminId))
                return Unauthorized(new { success = false, message = "Invalid token" });

            // Check if user is admin (from JWT claim OR from database)
            var isAdminClaim = User.FindFirst(ClaimTypes.Role)?.Value == "Admin";
            bool isAdminInDb = false;
            
            if (!isAdminClaim)
            {
                var user = await _teacherService.GetUserById(adminId);
                isAdminInDb = user?.IsAdmin ?? false;
            }

            if (!isAdminClaim && !isAdminInDb)
                return BadRequest(new { success = false, message = "Admin role required. Please ensure your account has admin privileges." });

            var result = await _teacherService.ReviewApplication(applicationId, reviewDto, adminId);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new
            {
                success = true,
                message = result.Message,
                application = result.Data
            });
        }
    }
}
