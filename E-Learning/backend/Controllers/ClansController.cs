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

        /// <summary>
        /// Helper method to check if user has leadership permission in clan (Leader/CoLeader/Elder)
        /// </summary>
        private async Task<(bool hasPermission, string? errorMessage)> CheckClanLeadershipPermissionAsync(int clanId, int userId, bool requireLeaderOnly = false)
        {
            var userMembership = await _clanService.GetUserClanMembership(clanId, userId);
            if (userMembership == null)
                return (false, "User is not a member of this clan");

            if (requireLeaderOnly && userMembership.Role != "Leader")
                return (false, "Only clan leader can perform this action");

            if (!requireLeaderOnly && !new[] { "Leader", "CoLeader", "Elder" }.Contains(userMembership.Role))
                return (false, "Only leadership can manage this clan");

            return (true, null);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllClans(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var currentUserId = User.Identity?.IsAuthenticated == true
                ? int.Parse(User.FindFirst("userId")?.Value ?? "0")
                : (int?)null;

            var result = await _clanService.GetAllClans(page, pageSize, currentUserId);
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
            var currentUserId = User.Identity?.IsAuthenticated == true
                ? int.Parse(User.FindFirst("userId")?.Value ?? "0")
                : (int?)null;

            var result = await _clanService.GetClanById(id, currentUserId);
            
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

            // Enforce leadership exclusivity: cannot create if already Leader/CoLeader in any clan
            var alreadyLeader = await _clanService.HasLeadershipRole(leaderId);
            if (alreadyLeader)
                return StatusCode(403, new { success = false, message = "You already hold a leadership role in a clan and cannot create a new one" });

            var result = await _clanService.CreateClan(clanDto, leaderId);
            
            if (!result.Success)
            {
                // If service flagged leadership conflict, return 403
                if (result.Message.Contains("leadership", StringComparison.OrdinalIgnoreCase))
                    return StatusCode(403, new { success = false, message = result.Message });
                return BadRequest(new { success = false, message = result.Message });
            }

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

            // Check leadership permission
            var (hasPermission, errorMessage) = await CheckClanLeadershipPermissionAsync(id, userId);
            if (!hasPermission)
                return Forbid();

            var result = await _clanService.UpdateClan(id, clanDto, userId);
            
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

            // Only clan leader can delete
            var (hasPermission, errorMessage) = await CheckClanLeadershipPermissionAsync(id, userId, requireLeaderOnly: true);
            if (!hasPermission)
                return Forbid();

            var result = await _clanService.DeleteClan(id, userId);
            
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
            var currentUserId = User.Identity?.IsAuthenticated == true
                ? int.Parse(User.FindFirst("userId")?.Value ?? "0")
                : (int?)null;

            var result = await _clanService.GetClanMembers(clanId, currentUserId);
            
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
        [HttpGet("{clanId}/join-requests/pending")]
        public async Task<IActionResult> GetPendingJoinRequests(int clanId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var membership = await _clanService.GetUserClanMembership(clanId, userId);
            if (membership == null || (membership.Role != "Leader" && membership.Role != "CoLeader"))
                return Forbid();

            var result = await _clanService.GetPendingJoinRequests(clanId, userId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, requests = result.Data });
        }

        [Authorize]
        [HttpPost("{clanId}/join-requests/{requestId}/decision")]
        public async Task<IActionResult> DecideJoinRequest(int clanId, int requestId, [FromBody] JoinRequestDecisionDTO decision)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var membership = await _clanService.GetUserClanMembership(clanId, userId);
            if (membership == null || (membership.Role != "Leader" && membership.Role != "CoLeader"))
                return Forbid();

            var action = decision.Action?.ToLower();
            if (action != "approve" && action != "reject")
                return BadRequest(new { success = false, message = "Action must be 'approve' or 'reject'" });

            var approve = action == "approve";
            var result = await _clanService.DecideJoinRequest(clanId, requestId, userId, approve);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = approve ? "Join request approved" : "Join request rejected" });
        }

        [Authorize]
        [HttpGet("my-clans")]
        public async Task<IActionResult> GetMyClans()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });
            var result = await _clanService.GetMyClans(userId);
            return Ok(new { success = true, clans = result.Data });
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

            // Check leadership permission
            var (hasPermission, errorMessage) = await CheckClanLeadershipPermissionAsync(clanId, userId);
            if (!hasPermission)
                return Forbid();

            var result = await _clanService.UpdateMemberRole(clanId, memberId, roleDto.Role, userId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = "Member role updated successfully" });
        }

        [Authorize]
        [HttpDelete("{clanId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(int clanId, int memberId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            // Check leadership permission
            var (hasPermission, errorMessage) = await CheckClanLeadershipPermissionAsync(clanId, userId);
            if (!hasPermission)
                return Forbid();

            var result = await _clanService.RemoveMember(clanId, memberId, userId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = "Member removed successfully" });
        }

        // CLAN ACTIVITIES

        [HttpGet("{clanId}/activities")]
        public async Task<IActionResult> GetClanActivities(int clanId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _clanService.GetClanActivities(clanId, page, pageSize);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, activities = result.Data, page, pageSize });
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
            var result = await _clanService.GetClanPosts(clanId, page, pageSize);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, posts = result.Data, page, pageSize, total = result.Data?.Count ?? 0 });
        }

        [Authorize]
        [HttpPost("{clanId}/posts")]
        public async Task<IActionResult> CreateClanPost(int clanId, [FromBody] CreateClanPostDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var membership = await _clanService.GetUserClanMembership(clanId, userId);
            if (membership == null)
                return Forbid();

            var result = await _clanService.CreateClanPost(clanId, userId, dto);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return CreatedAtAction(nameof(GetClanPosts), new { clanId = clanId }, new { success = true, post = result.Data });
        }

        [Authorize]
        [HttpPost("{clanId}/posts/{postId}/react")]
        public async Task<IActionResult> ReactToPost(int clanId, int postId, [FromBody] AddReactionDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var membership = await _clanService.GetUserClanMembership(clanId, userId);
            if (membership == null)
                return Forbid();

            var result = await _clanService.ReactToPost(postId, userId, dto.Emoji);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true });
        }

        [Authorize]
        [HttpPost("{clanId}/posts/{postId}/vote")]
        public async Task<IActionResult> VoteOnPost(int clanId, int postId, [FromQuery] int vote)
        {
            if (vote != 1 && vote != -1)
                return BadRequest(new { success = false, message = "Vote must be 1 (upvote) or -1 (downvote)" });

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var membership = await _clanService.GetUserClanMembership(clanId, userId);
            if (membership == null)
                return Forbid();

            var result = await _clanService.VoteOnPost(postId, userId, vote);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true });
        }

        // ANNOUNCEMENTS

        [HttpGet("{clanId}/announcements")]
        public async Task<IActionResult> GetClanAnnouncements(int clanId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var currentUserId = User.Identity?.IsAuthenticated == true
                ? int.Parse(User.FindFirst("userId")?.Value ?? "0")
                : (int?)null;

            var result = await _clanService.GetClanAnnouncements(clanId, currentUserId, page, pageSize);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, announcements = result.Data, page, pageSize, total = result.Data?.Count ?? 0 });
        }

        [Authorize]
        [HttpPost("{clanId}/announcements")]
        public async Task<IActionResult> CreateAnnouncement(int clanId, [FromBody] CreateAnnouncementDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            // Only Leaders or CoLeaders can create announcements (service enforces too)
            var membership = await _clanService.GetUserClanMembership(clanId, userId);
            if (membership == null || (membership.Role != "Leader" && membership.Role != "CoLeader"))
                return Forbid();

            var result = await _clanService.CreateAnnouncement(clanId, userId, dto);
            if (!result.Success)
            {
                if (result.Message != null && result.Message.Contains("Only Leaders", StringComparison.OrdinalIgnoreCase))
                    return Forbid();
                return BadRequest(new { success = false, message = result.Message });
            }

            return CreatedAtAction(nameof(GetClanAnnouncements), new { clanId = clanId }, new { success = true, announcement = result.Data });
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
            var result = await _clanService.GetClanLeaderboard(timeframe, universityId, departmentId, page, pageSize);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, leaderboard = result.Data, page, pageSize, total = result.Data?.Count ?? 0 });
        }

        [HttpGet("top-clans")]
        public async Task<IActionResult> GetTopClans()
        {
            var result = await _clanService.GetTopClans(10);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, clans = result.Data });
        }

        // CLAN INVITATIONS

        [Authorize]
        [HttpPost("{clanId}/invite/{userId}")]
        public async Task<IActionResult> InviteToClan(int clanId, int userId)
        {
            var inviterId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (inviterId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

           
            var (hasPermission, errorMessage) = await CheckClanLeadershipPermissionAsync(clanId, inviterId);
            if (!hasPermission)
                return Forbid();

            var result = await _clanService.InviteUser(clanId, inviterId, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "User invited to clan successfully",
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
            var result = await _clanService.GetClanInvitations(userId);
            return Ok(new { success = true, invitations = result.Data });
        }
        [Authorize]
[HttpPost("{clanId}/announcements/{announcementId}/react")]
public async Task<IActionResult> ReactToAnnouncement(int clanId, int announcementId, [FromBody] AddReactionDTO dto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
    if (userId == 0)
        return Unauthorized(new { success = false, message = "Invalid token" });

    var membership = await _clanService.GetUserClanMembership(clanId, userId);
    if (membership == null)
        return Forbid();

    var result = await _clanService.ReactToAnnouncement(announcementId, userId, dto.Emoji);
    if (!result.Success)
        return BadRequest(new { success = false, message = result.Message });

    return Ok(new { success = true });
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