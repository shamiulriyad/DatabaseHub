using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CompetitionRegistrationService : ICompetitionRegistrationService
    {
        private readonly ApplicationDbContext _context;

        public CompetitionRegistrationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<bool>> RegisterTeam(CompetitionRegisterTeamDTO dto, int actorUserId)
        {
            try
            {
                var competition = await _context.Competitions.FindAsync(dto.CompetitionId);
                if (competition == null)
                    return ServiceResult<bool>.FailureResult("Competition not found");

                // allow registration before and during contest
                if (!(string.Equals(competition.Status, "Upcoming", StringComparison.OrdinalIgnoreCase) ||
                      string.Equals(competition.Status, "Ongoing", StringComparison.OrdinalIgnoreCase) ||
                      string.Equals(competition.Status, "Active", StringComparison.OrdinalIgnoreCase)))
                {
                    return ServiceResult<bool>.FailureResult("Competition is not open for registration");
                }

                var team = await _context.Teams.FindAsync(dto.TeamId);
                if (team == null)
                    return ServiceResult<bool>.FailureResult("Team not found");

                if (!competition.IsTeamBased)
                    return ServiceResult<bool>.FailureResult("This competition does not accept team registration");

                var clan = await _context.Clans.FindAsync(team.ClanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Team's clan not found");

                // check actor permission: either team creator or clan leader
                if (team.CreatedBy != actorUserId && clan.LeaderId != actorUserId)
                    return ServiceResult<bool>.FailureResult("Only team creator or clan leader can register the team");

                // check duplicates
                var already = await _context.CompetitionRegistrations
                    .AnyAsync(r => r.CompetitionId == dto.CompetitionId && r.TeamId == dto.TeamId);
                if (already)
                    return ServiceResult<bool>.FailureResult("Team is already registered for this competition");

                // verify team size against competition rules (ICPC clan team: 3-4)
                var memberCount = await _context.TeamMembers.CountAsync(tm => tm.TeamId == dto.TeamId);
                if (memberCount < 3 || memberCount > 4)
                    return ServiceResult<bool>.FailureResult("Team size must be between 3 and 4 members");

                if (competition.IsTeamBased && memberCount > competition.TeamSize)
                    return ServiceResult<bool>.FailureResult($"Team size exceeds competition team size limit ({competition.TeamSize})");

                var now = DateTime.UtcNow;
                var isOngoingNow = competition.IsApproved && now >= competition.StartDate && now <= competition.EndDate;
                var registrationStatus = isOngoingNow ? "Approved" : "Pending";

                var registration = new CompetitionRegistration
                {
                    CompetitionId = dto.CompetitionId,
                    TeamId = dto.TeamId,
                    Status = registrationStatus,
                    RegisteredAt = DateTime.UtcNow
                };

                _context.CompetitionRegistrations.Add(registration);
                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true, "Registration created");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Registration failed: {ex.Message}");
            }
        }
    }
}
