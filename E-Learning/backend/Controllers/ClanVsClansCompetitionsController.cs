using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/clan-vs-clans-competitions")]
    public class ClanVsClansCompetitionsController : ControllerBase
    {
        private readonly IClanVsClansCompetitionService _competitionService;

        public ClanVsClansCompetitionsController(IClanVsClansCompetitionService competitionService)
        {
            _competitionService = competitionService;
        }

        /// <summary>
        /// Helper method to get current user ID from claims
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            return !string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        /// <summary>
        /// Create a new clan vs clan competition challenge
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCompetition([FromBody] CreateClanVsClansCompetitionDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input data", errors = ModelState });

            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized(new { success = false, message = "User not authenticated" });

            var result = await _competitionService.CreateCompetitionAsync(userId, dto);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return CreatedAtAction(nameof(GetCompetition), new { id = result.Data.Id }, 
                new { success = true, message = result.Message, data = result.Data });
        }

        /// <summary>
        /// Get detailed information about a competition
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompetition(int id)
        {
            var result = await _competitionService.GetCompetitionAsync(id);

            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        /// <summary>
        /// Get all competitions for a clan (both as challenger and opponent)
        /// </summary>
        [HttpGet("clan/{clanId}")]
        public async Task<IActionResult> GetClanCompetitions(int clanId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _competitionService.GetClanCompetitionsAsync(clanId, page, pageSize);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        /// <summary>
        /// Get pending challenges for a clan (challenges they need to respond to)
        /// </summary>
        [HttpGet("clan/{clanId}/pending")]
        public async Task<IActionResult> GetPendingChallenges(int clanId)
        {
            var result = await _competitionService.GetPendingChallengesAsync(clanId);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        /// <summary>
        /// Accept a competition challenge
        /// </summary>
        [HttpPost("{id}/accept")]
        [Authorize]
        public async Task<IActionResult> AcceptChallenge(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized(new { success = false, message = "User not authenticated" });

            var result = await _competitionService.AcceptChallengeAsync(id, userId);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new
            {
                success = true,
                message = result.Message,
                competitionId = result.Data.Id,
                redirectUrl = $"/clans-competitions/{result.Data.Id}",
                data = result.Data
            });
        }

        /// <summary>
        /// Reject a competition challenge
        /// </summary>
        [HttpPost("{id}/reject")]
        [Authorize]
        public async Task<IActionResult> RejectChallenge(int id, [FromBody] AcceptClanVsClansCompetitionDTO dto)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized(new { success = false, message = "User not authenticated" });

            var result = await _competitionService.RejectChallengeAsync(id, userId, dto?.RejectionReason);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new
            {
                success = true,
                message = result.Message,
                competitionId = result.Data.Id,
                redirectUrl = "/clans-competitions",
                data = result.Data
            });
        }

        /// <summary>
        /// Select participants for the competition
        /// </summary>
        [HttpPost("{id}/select-participants")]
        [Authorize]
        public async Task<IActionResult> SelectParticipants(int id, [FromBody] SelectClanVsClansCompetitionParticipantsDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input data" });

            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized(new { success = false, message = "User not authenticated" });

            var result = await _competitionService.SelectParticipantsAsync(id, userId, dto.SelectedUserIds);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = result.Message, data = result.Data });
        }

        /// <summary>
        /// Confirm participant selection (lock participants, ready for competition)
        /// </summary>
        [HttpPost("{id}/confirm-participants/{clanId}")]
        [Authorize]
        public async Task<IActionResult> ConfirmParticipants(int id, int clanId)
        {
            var result = await _competitionService.ConfirmParticipantSelectionAsync(id, clanId);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = result.Message });
        }

        /// <summary>
        /// Get all questions for a competition (available only during/after competition)
        /// </summary>
        [HttpGet("{id}/questions")]
        public async Task<IActionResult> GetCompetitionQuestions(int id)
        {
            var result = await _competitionService.GetCompetitionQuestionsAsync(id);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        /// <summary>
        /// Submit an answer during the competition
        /// </summary>
        [HttpPost("{id}/submit-answer")]
        [Authorize]
        public async Task<IActionResult> SubmitAnswer(int id, [FromBody] SubmitClanVsClansCompetitionAnswerDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input data" });

            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized(new { success = false, message = "User not authenticated" });

            var result = await _competitionService.SubmitAnswerAsync(id, userId, dto);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = "Answer submitted successfully", data = result.Data });
        }

        /// <summary>
        /// Complete the competition and finalize results
        /// </summary>
        [HttpPost("{id}/complete")]
        [Authorize]
        public async Task<IActionResult> CompleteCompetition(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized(new { success = false, message = "User not authenticated" });

            var result = await _competitionService.CompleteCompetitionAsync(id, userId);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = "Competition completed", data = result.Data });
        }

        /// <summary>
        /// Start the competition (transitions from Scheduled to Ongoing)
        /// </summary>
        [HttpPost("{id}/start")]
        [Authorize]
        public async Task<IActionResult> StartCompetition(int id)
        {
            var result = await _competitionService.StartCompetitionAsync(id);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = result.Message, data = result.Data });
        }

        /// <summary>
        /// Get final results of the competition
        /// </summary>
        [HttpGet("{id}/results")]
        public async Task<IActionResult> GetResults(int id)
        {
            var result = await _competitionService.GetCompetitionResultsAsync(id);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        /// <summary>
        /// Get results for a specific clan in the competition
        /// </summary>
        [HttpGet("{id}/results/clan/{clanId}")]
        public async Task<IActionResult> GetClanResults(int id, int clanId)
        {
            var result = await _competitionService.GetClanParticipantResultsAsync(id, clanId);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }
    }
}
