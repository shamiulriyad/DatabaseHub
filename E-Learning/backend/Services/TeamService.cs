using AutoMapper;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TeamService : ITeamService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public TeamService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResult<backend.DTOs.TeamInfoDTO>> CreateTeam(TeamCreateDTO dto, int actorUserId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(dto.ClanId);
                if (clan == null)
                    return ServiceResult<backend.DTOs.TeamInfoDTO>.FailureResult("Clan not found");

                if (clan.LeaderId != actorUserId)
                    return ServiceResult<backend.DTOs.TeamInfoDTO>.FailureResult("Only clan leader can create a team");

                var team = new Team
                {
                    Name = dto.Name,
                    ClanId = dto.ClanId,
                    CreatedBy = actorUserId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Teams.Add(team);
                await _context.SaveChangesAsync();

                // add creator as first member
                var member = new TeamMember
                {
                    TeamId = team.Id,
                    UserId = actorUserId,
                    JoinedAt = DateTime.UtcNow
                };
                _context.TeamMembers.Add(member);
                await _context.SaveChangesAsync();

                await _context.Entry(team).Collection(t => t.Members).LoadAsync();
                var dtoResult = _mapper.Map<backend.DTOs.TeamInfoDTO>(team);
                return ServiceResult<backend.DTOs.TeamInfoDTO>.SuccessResult(dtoResult);
            }
            catch (Exception ex)
            {
                return ServiceResult<backend.DTOs.TeamInfoDTO>.FailureResult($"Create team failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> AddMember(AddTeamMemberDTO dto, int actorUserId)
        {
            try
            {
                var team = await _context.Teams.FindAsync(dto.TeamId);
                if (team == null)
                    return ServiceResult<bool>.FailureResult("Team not found");

                var clan = await _context.Clans.FindAsync(team.ClanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                if (clan.LeaderId != actorUserId)
                    return ServiceResult<bool>.FailureResult("Only clan leader can manage teams");

                // check if user is clan member
                var isClanMember = await _context.ClanMembers.AnyAsync(cm => cm.ClanId == clan.Id && cm.UserId == dto.UserId);
                if (!isClanMember)
                    return ServiceResult<bool>.FailureResult("User is not a member of the clan");

                var existing = await _context.TeamMembers.AnyAsync(tm => tm.TeamId == dto.TeamId && tm.UserId == dto.UserId);
                if (existing)
                    return ServiceResult<bool>.FailureResult("User is already a member of the team");

                var memberCount = await _context.TeamMembers.CountAsync(tm => tm.TeamId == dto.TeamId);
                if (memberCount >= 4)
                    return ServiceResult<bool>.FailureResult("Team cannot have more than 4 members");

                var member = new TeamMember
                {
                    TeamId = dto.TeamId,
                    UserId = dto.UserId,
                    JoinedAt = DateTime.UtcNow
                };

                _context.TeamMembers.Add(member);
                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true, "Member added");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Add member failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> RemoveMember(RemoveTeamMemberDTO dto, int actorUserId)
        {
            try
            {
                var team = await _context.Teams.FindAsync(dto.TeamId);
                if (team == null)
                    return ServiceResult<bool>.FailureResult("Team not found");

                var clan = await _context.Clans.FindAsync(team.ClanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                if (clan.LeaderId != actorUserId)
                    return ServiceResult<bool>.FailureResult("Only clan leader can manage teams");

                var member = await _context.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == dto.TeamId && tm.UserId == dto.UserId);
                if (member == null)
                    return ServiceResult<bool>.FailureResult("Member not found in team");

                _context.TeamMembers.Remove(member);
                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true, "Member removed");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Remove member failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<backend.DTOs.TeamInfoDTO>>> GetClanTeams(int clanId)
        {
            try
            {
                var teams = await _context.Teams
                    .Where(t => t.ClanId == clanId)
                    .Include(t => t.Members)
                        .ThenInclude(m => m.User)
                    .ToListAsync();

                var dtos = _mapper.Map<List<backend.DTOs.TeamInfoDTO>>(teams);
                return ServiceResult<List<backend.DTOs.TeamInfoDTO>>.SuccessResult(dtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<backend.DTOs.TeamInfoDTO>>.FailureResult($"Get teams failed: {ex.Message}");
            }
        }
    }
}
