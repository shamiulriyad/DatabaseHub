using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IClanService
    {
        Task<ServiceResult<ClanDTO>> CreateClan(CreateClanDTO dto, int userId);
        Task<ServiceResult<ClanDTO>> GetClanById(int clanId);
        Task<ServiceResult<List<ClanDTO>>> GetAllClans(int page, int pageSize);
        Task<ServiceResult<List<ClanDTO>>> SearchClans(ClanSearchFilterDTO filter);
        Task<ServiceResult<ClanDTO>> UpdateClan(int clanId, UpdateClanDTO dto);
        Task<ServiceResult<bool>> DeleteClan(int clanId);
        Task<ServiceResult<List<ClanMemberDTO>>> GetClanMembers(int clanId);
        Task<ServiceResult<JoinResponseDTO>> JoinClan(int clanId, int userId, JoinRequestDTO? request = null);
        Task<ServiceResult<bool>> LeaveClan(int clanId, int userId);
        Task<ServiceResult<List<InvitationDTO>>> GetClanInvitations(int clanId);
        Task<ServiceResult<bool>> InviteUser(int clanId, int userId, int invitedUserId);
        Task<ServiceResult<bool>> AcceptInvitation(int invitationId);
        Task<ServiceResult<bool>> RejectInvitation(int invitationId);
        Task<ServiceResult<ClanStatsDTO>> GetClanStats(int clanId);
        Task<ServiceResult<List<CompetitionDTO>>> GetClanCompetitionsBySeason(int clanId, int? season = null);
        Task<ServiceResult<List<CompetitionDTO>>> GetClanCompetitions(int clanId);
    }
}
