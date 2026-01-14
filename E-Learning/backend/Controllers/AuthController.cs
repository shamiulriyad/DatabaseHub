using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.Register(registerDto);
            
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { 
                success = true,
                message = "Registration successful", 
                token = result.Data.Token,
                user = new {
                    id = result.Data.User.Id,
                    username = result.Data.User.Username,
                    email = result.Data.User.Email,
                    firstName = result.Data.User.FirstName,
                    lastName = result.Data.User.LastName,
                    isStudent = result.Data.User.IsStudent,
                    isTeacher = result.Data.User.IsTeacher,
                    isCompetitor = result.Data.User.IsCompetitor,
                    isAdmin = result.Data.User.IsAdmin
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.Login(loginDto);
            
            if (!result.Success)
                return Unauthorized(new { 
                    success = false,
                    message = result.Message 
                });

            return Ok(new { 
                success = true,
                message = "Login successful", 
                token = result.Data.Token,
                user = new {
                    id = result.Data.User.Id,
                    username = result.Data.User.Username,
                    email = result.Data.User.Email,
                    firstName = result.Data.User.FirstName,
                    lastName = result.Data.User.LastName,
                    profileImageUrl = result.Data.User.ProfileImageUrl,
                    isStudent = result.Data.User.IsStudent,
                    isTeacher = result.Data.User.IsTeacher,
                    isCompetitor = result.Data.User.IsCompetitor,
                    isAdmin = result.Data.User.IsAdmin,
                    totalPoints = result.Data.User.TotalPoints,
                    currentRank = result.Data.User.CurrentRank
                }
            });
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _authService.GetUserProfile(userId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                user = result.Data
            });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetPublicUserProfile(int userId)
        {
            var result = await _authService.GetUserProfile(userId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                user = result.Data
            });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO profileDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _authService.UpdateProfile(userId, profileDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { 
                success = true,
                message = "Profile updated successfully",
                user = result.Data
            });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO passwordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _authService.ChangePassword(userId, passwordDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { 
                success = true,
                message = "Password changed successfully" 
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.ForgotPassword(forgotPasswordDto.Email);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { 
                success = true,
                message = "Password reset link sent to email" 
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO resetPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.ResetPassword(resetPasswordDto.Token, resetPasswordDto.NewPassword);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { 
                success = true,
                message = "Password reset successful" 
            });
        }

        [Authorize]
        [HttpPost("become-teacher")]
        public async Task<IActionResult> BecomeTeacher()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _authService.BecomeTeacher(userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { 
                success = true,
                message = "You are now a teacher. You can create courses.",
                user = new {
                    isTeacher = result.Data.IsTeacher
                }
            });
        }

        [Authorize]
        [HttpPost("join-competition")]
        public async Task<IActionResult> JoinCompetitionMode()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _authService.JoinCompetitionMode(userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { 
                success = true,
                message = "You are now in competition mode",
                user = new {
                    isCompetitor = result.Data.IsCompetitor
                }
            });
        }

        [Authorize]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _authService.GetUserDashboard(userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                dashboard = result.Data
            });
        }
    }
}