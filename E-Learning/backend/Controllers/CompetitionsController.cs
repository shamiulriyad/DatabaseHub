using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompetitionsController : ControllerBase
    {
        private readonly ICompetitionService _competitionService;
        private readonly IClanService _clanService;

        public CompetitionsController(ICompetitionService competitionService, IClanService clanService)
        {
            _competitionService = competitionService;
            _clanService = clanService;
        }

        /// <summary>
        /// Provides all necessary clan/role/permission data for competition creation (self-contained for frontend)
        /// </summary>
        [Authorize]
        [HttpGet("create-context")]
        public async Task<IActionResult> GetCreateContext()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            // Get all clans the user is a member of
            var myClansResult = await _clanService.GetMyClans(userId);
            if (!myClansResult.Success)
                return BadRequest(new { success = false, message = myClansResult.Message });

            // Identify which clans the user is a leader/co-leader of
            var leaderClans = myClansResult.Data?.Where(c => c.MemberRole == "Leader" || c.MemberRole == "CoLeader").ToList() ?? new List<backend.DTOs.ClanDTO>();

            return Ok(new {
                success = true,
                clans = myClansResult.Data,
                leaderClans = leaderClans,
                userId = userId
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCompetitions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _competitionService.GetAllCompetitions(page, pageSize);
            
            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = result.Data
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompetition(int id)
        {
            var result = await _competitionService.GetCompetitionById(id);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = result.Data
            });
        }

        [HttpGet("{id}/questions")]
        [Authorize]
        public async Task<IActionResult> GetCompetitionQuestions(int id)
        {
            var result = await _competitionService.GetCompetitionQuestions(id);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = result.Data
            });
        }

        /// <summary>
        /// ADMIN ENDPOINT: Get questions for competition creator/admin (anytime access)
        /// Codeforces-style: Admin can see questions before contest starts
        /// </summary>
        [HttpGet("{id}/admin/questions")]
        [Authorize]
        public async Task<IActionResult> GetAdminQuestions(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _competitionService.GetAdminQuestions(id, userId);
            
            if (!result.Success)
                return result.Success ? 
                    NotFound(new { success = false, message = result.Message }) :
                    Forbid();

            return Ok(new {
                success = true,
                message = result.Message,
                data = result.Data
            });
        }

        /// <summary>
        /// PARTICIPANT ENDPOINT: Get questions (ONLY during Ongoing status)
        /// Codeforces-style: Questions only visible when contest is running
        /// Requires: User is registered participant
        /// </summary>
        [HttpGet("{id}/participant/questions")]
        [Authorize]
        public async Task<IActionResult> GetParticipantQuestions(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _competitionService.GetParticipantQuestions(id, userId);
            
            if (!result.Success)
                return result.Success ? 
                    NotFound(new { success = false, message = result.Message }) :
                    Forbid();

            return Ok(new {
                success = true,
                message = result.Message,
                data = result.Data
            });
        }

        [Authorize(Roles = "Teacher,Admin,Student")]
        [HttpPost]
        public async Task<IActionResult> CreateCompetition([FromBody] CreateCompetitionDTO competitionDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var creatorId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (creatorId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _competitionService.CreateCompetition(competitionDto, creatorId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return CreatedAtAction(nameof(GetCompetition), new { id = result.Data?.Id }, new {
                success = true,
                message = result.Message,
                data = result.Data
            });
        }

        [Authorize(Roles = "Teacher,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCompetition(int id, [FromBody] UpdateCompetitionDTO competitionDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _competitionService.UpdateCompetition(id, competitionDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Competition updated successfully",
                data = result.Data
            });
        }

        [Authorize(Roles = "Teacher,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompetition(int id)
        {
            var result = await _competitionService.DeleteCompetition(id);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Competition deleted successfully"
            });
        }

        // PARTICIPATION

        [Authorize]
        [HttpPost("{id}/join")]
        public async Task<IActionResult> JoinCompetition(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _competitionService.JoinCompetition(id, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Joined competition successfully"
            });
        }

        [Authorize]
        [HttpPost("{id}/leave")]
        public async Task<IActionResult> LeaveCompetition(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _competitionService.LeaveCompetition(id, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Left competition successfully"
            });
        }

        // RESULTS & LEADERBOARD

        [HttpGet("{id}/leaderboard")]
        public async Task<IActionResult> GetCompetitionLeaderboard(int id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _competitionService.GetCompetitionLeaderboard(id, page, pageSize);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = result.Data
            });
        }

        // USER COMPETITIONS

        [Authorize]
        [HttpGet("user/my-competitions")]
        public async Task<IActionResult> GetMyCompetitions()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _competitionService.GetUserCompetitions(userId);
            
            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = result.Data
            });
        }

        [Authorize]
        [HttpPost("{id}/submit-answers")]
        public async Task<IActionResult> SubmitCompetitionAnswers(int id, [FromBody] DTOs.SubmitCompetitionAnswersDTO payload)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _competitionService.SubmitCompetitionAnswers(id, userId, payload);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = result.Message, data = result.Data });
        }

        // STATS

        [HttpGet("{id}/stats")]
        public async Task<IActionResult> GetCompetitionStats(int id)
        {
            var result = await _competitionService.GetCompetitionStats(id);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = result.Data
            });
        }

        // ADMIN APPROVAL

        [Authorize(Roles = "Admin")]
        [HttpGet("pending-competitions")]
        public async Task<IActionResult> GetPendingCompetitions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _competitionService.GetPendingCompetitions(page, pageSize);
            
            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = result.Data
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all-competitions")]
        public async Task<IActionResult> GetAllCompetitionsForAdmin(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var result = await _competitionService.GetAllCompetitionsForAdmin(page, pageSize);
            
            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = result.Data
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveCompetition(int id)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _competitionService.ApproveCompetition(id, adminId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = result.Message,
                data = result.Data
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectCompetition(int id)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _competitionService.RejectCompetition(id, adminId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = result.Message
            });
        }
    }
}
