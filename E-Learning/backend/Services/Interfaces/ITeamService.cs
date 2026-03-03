using backend.DTOs;

namespace backend.Services.Interfaces
{
    public interface ITeamService
    {
        Task<ServiceResult<backend.DTOs.TeamInfoDTO>> CreateTeam(TeamCreateDTO dto, int actorUserId);
        Task<ServiceResult<bool>> AddMember(AddTeamMemberDTO dto, int actorUserId);
        Task<ServiceResult<bool>> RemoveMember(RemoveTeamMemberDTO dto, int actorUserId);
        Task<ServiceResult<List<backend.DTOs.TeamInfoDTO>>> GetClanTeams(int clanId);
    }
}
