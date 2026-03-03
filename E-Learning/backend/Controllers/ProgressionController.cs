using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProgressionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProgressionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProgression()
        {
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { success = false, message = "Invalid token" });

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { success = false, message = "User not found" });

            var nextThreshold = await _context.LevelThresholds
                .AsNoTracking()
                .Where(t => t.RequiredExp > user.Exp)
                .OrderBy(t => t.RequiredExp)
                .FirstOrDefaultAsync();

            var dto = new UserProgressionDTO
            {
                UserId = user.Id,
                Username = user.Username,
                Exp = user.Exp,
                Level = user.Level,
                NextLevelRequiredExp = nextThreshold?.RequiredExp,
                ExpToNextLevel = nextThreshold == null ? 0 : Math.Max(0, nextThreshold.RequiredExp - user.Exp)
            };

            return Ok(new { success = true, progression = dto });
        }

        [HttpGet("me/history")]
        public async Task<IActionResult> GetMyCompetitionHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { success = false, message = "Invalid token" });

            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.UserCompetitionHistories
                .AsNoTracking()
                .Where(h => h.UserId == userId)
                .Include(h => h.Competition)
                .Include(h => h.ClanTeam)
                .OrderByDescending(h => h.Date);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(h => new CompetitionHistoryItemDTO
                {
                    CompetitionId = h.CompetitionId,
                    CompetitionTitle = h.Competition.Title,
                    ClanTeamId = h.ClanTeamId,
                    ClanTeamName = h.ClanTeam.Name,
                    Position = h.Position,
                    EarnedExp = h.EarnedExp,
                    Date = h.Date
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                history = items,
                page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }
    }
}
