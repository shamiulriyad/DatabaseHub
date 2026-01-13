using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClansController : ControllerBase
    {
        private readonly IClanService _clanService;

        public ClansController(IClanService clanService)
        {
            _clanService = clanService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllClans(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _clanService.GetAllClans(page, pageSize);
            return Ok(new {
                success = result.Success,
                clans = result.Data,
                totalCount = result.Data?.Count ?? 0,
                page = page,
                pageSize = pageSize
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClan(int id)
        {
            var result = await _clanService.GetClanById(id);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                clan = result.Data
            });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateClan([FromBody] CreateClanDTO clanDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var leaderId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (leaderId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _clanService.CreateClan(clanDto, leaderId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return CreatedAtAction(nameof(GetClan), new { id = result.Data.Id }, new {
                success = true,
                message = "Clan created successfully",
                clan = result.Data
            });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClan(int id, [FromBody] UpdateClanDTO clanDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _clanService.UpdateClan(id, clanDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Clan updated successfully",
                clan = result.Data
            });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClan(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _clanService.DeleteClan(id);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Clan deleted successfully"
            });
        }

        // CLAN MEMBERSHIP

        [HttpGet("{clanId}/members")]
        public async Task<IActionResult> GetClanMembers(int clanId,
            [FromQuery] string? role = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _clanService.GetClanMembers(clanId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                members = result.Data
            });
        }

        [Authorize]
        [HttpPost("{clanId}/join")]
        public async Task<IActionResult> JoinClan(int clanId, [FromBody] JoinRequestDTO? request = null)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _clanService.JoinClan(clanId, userId, request);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = result.Data?.Status == "Pending" 
                    ? "Join request sent. Awaiting clan leader approval." 
                    : "Successfully joined clan!",
                membership = result.Data
            });
        }

        [Authorize]
        [HttpPost("{clanId}/leave")]
        public async Task<IActionResult> LeaveClan(int clanId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _clanService.LeaveClan(clanId, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Left clan successfully"
            });
        }

        [Authorize]
        [HttpGet("my-clans")]
        public async Task<IActionResult> GetMyClans()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });
            // Not implemented in current service; return empty list
            return Ok(new { success = true, clans = new List<ClanDTO>() });
        }

        [Authorize]
        [HttpPut("{clanId}/members/{memberId}/role")]
        public async Task<IActionResult> UpdateMemberRole(int clanId, int memberId, [FromBody] UpdateMemberRoleDTO roleDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });
            // Not implemented in current service
            return StatusCode(501, new { success = false, message = "Member role update not supported." });
        }

        [Authorize]
        [HttpDelete("{clanId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(int clanId, int memberId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });
            // Not implemented in current service
            return StatusCode(501, new { success = false, message = "Remove member not supported." });
        }

        // CLAN ACTIVITIES

        [HttpGet("{clanId}/activities")]
        public async Task<IActionResult> GetClanActivities(int clanId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            // Not implemented in current service
            return StatusCode(501, new { success = false, message = "Clan activities not supported." });
        }

        [HttpGet("{clanId}/competitions")]
        public async Task<IActionResult> GetClanCompetitions(int clanId, [FromQuery] int? season = null)
        {
            var result = await _clanService.GetClanCompetitionsBySeason(clanId, season);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                competitions = result.Data,
                season = season,
                total = result.Data?.Count ?? 0
            });
        }

        [HttpGet("{clanId}/posts")]
        public async Task<IActionResult> GetClanPosts(int clanId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            // Not implemented in current service
            return StatusCode(501, new { success = false, message = "Clan posts not supported." });
        }

        // CLAN STATS & RANKING

        [HttpGet("{clanId}/stats")]
        public async Task<IActionResult> GetClanStats(int clanId)
        {
            var result = await _clanService.GetClanStats(clanId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                stats = result.Data
            });
        }

        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetClanLeaderboard(
            [FromQuery] string? timeframe = "weekly", // weekly, monthly, alltime
            [FromQuery] int? universityId = null,
            [FromQuery] int? departmentId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            // Not implemented in current service
            return StatusCode(501, new { success = false, message = "Clan leaderboard not supported." });
        }

        [HttpGet("top-clans")]
        public async Task<IActionResult> GetTopClans()
        {
            // Not implemented in current service
            return StatusCode(501, new { success = false, message = "Top clans not supported." });
        }

        // CLAN INVITATIONS

        [Authorize]
        [HttpPost("{clanId}/invite/{userId}")]
        public async Task<IActionResult> InviteToClan(int clanId, int userId)
        {
            var inviterId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (inviterId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            // Interface method InviteUser(clanId, userId, invitedUserId)
            var result = await _clanService.InviteUser(clanId, inviterId, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "User invited to clan",
                invitation = result.Data
            });
        }

        [Authorize]
        [HttpGet("invitations")]
        public async Task<IActionResult> GetMyInvitations()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });
            // Not implemented in current service; return empty list
            return Ok(new { success = true, invitations = new List<InvitationDTO>() });
        }

        [Authorize]
        [HttpPost("invitations/{invitationId}/accept")]
        public async Task<IActionResult> AcceptInvitation(int invitationId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _clanService.AcceptInvitation(invitationId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Invitation accepted. You are now a member of the clan.",
                membership = result.Data
            });
        }

        [Authorize]
        [HttpPost("invitations/{invitationId}/reject")]
        public async Task<IActionResult> RejectInvitation(int invitationId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _clanService.RejectInvitation(invitationId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Invitation rejected"
            });
        }

        // CLAN SEARCH

        [HttpGet("search")]
        public async Task<IActionResult> SearchClans(
            [FromQuery] string? query,
            [FromQuery] string? clanType = null,
            [FromQuery] int? universityId = null,
            [FromQuery] int? departmentId = null,
            [FromQuery] int? minRanking = null,
            [FromQuery] int? maxRanking = null,
            [FromQuery] int? minMemberCount = null,
            [FromQuery] int? maxMemberCount = null,
            [FromQuery] bool? isPublic = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortOrder = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var filter = new ClanSearchFilterDTO
            {
                Query = query,
                ClanType = clanType,
                UniversityId = universityId,
                DepartmentId = departmentId,
                MinRanking = minRanking,
                MaxRanking = maxRanking,
                MinMemberCount = minMemberCount,
                MaxMemberCount = maxMemberCount,
                IsPublic = isPublic,
                SortBy = sortBy,
                SortOrder = sortOrder,
                Page = page,
                PageSize = pageSize
            };

            var result = await _clanService.SearchClans(filter);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                clans = result.Data,
                page = page,
                pageSize = pageSize,
                total = result.Data?.Count ?? 0
            });
        }
    }
}