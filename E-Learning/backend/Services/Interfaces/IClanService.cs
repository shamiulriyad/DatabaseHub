using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IClanService
    {
        Task<ServiceResult<ClanDTO>> CreateClan(CreateClanDTO dto, int userId);
        Task<ServiceResult<ClanDTO>> GetClanById(int clanId, int? currentUserId = null);
        Task<ServiceResult<List<ClanDTO>>> GetAllClans(int page, int pageSize, int? currentUserId = null);
        Task<ServiceResult<List<ClanDTO>>> SearchClans(ClanSearchFilterDTO filter, int? currentUserId = null);
        Task<ServiceResult<ClanDTO>> UpdateClan(int clanId, UpdateClanDTO dto, int actorUserId);
        Task<ServiceResult<bool>> DeleteClan(int clanId, int actorUserId);
        Task<ServiceResult<List<ClanMemberDTO>>> GetClanMembers(int clanId, int? currentUserId = null);
        Task<ServiceResult<JoinResponseDTO>> JoinClan(int clanId, int userId, JoinRequestDTO? request = null);
        Task<ServiceResult<bool>> LeaveClan(int clanId, int userId);
        Task<ServiceResult<List<ClanDTO>>> GetMyClans(int userId);
        Task<ServiceResult<bool>> UpdateMemberRole(int clanId, int memberId, string role, int actorUserId);
        Task<ServiceResult<bool>> RemoveMember(int clanId, int memberId, int actorUserId);
        Task<ServiceResult<List<InvitationDTO>>> GetClanInvitations(int userId);
        Task<ServiceResult<bool>> InviteUser(int clanId, int actorUserId, int invitedUserId);
        Task<ServiceResult<bool>> AcceptInvitation(int invitationId);
        Task<ServiceResult<bool>> RejectInvitation(int invitationId);
        Task<ServiceResult<ClanStatsDTO>> GetClanStats(int clanId);
        Task<ServiceResult<List<CompetitionDTO>>> GetClanCompetitionsBySeason(int clanId, int? season = null);
        Task<ServiceResult<List<CompetitionDTO>>> GetClanCompetitions(int clanId);
        Task<ServiceResult<List<ClanActivityDTO>>> GetClanActivities(int clanId, int page, int pageSize);
        Task<ServiceResult<List<PostDTO>>> GetClanPosts(int clanId, int page, int pageSize);
        Task<ServiceResult<List<ClanLeaderboardDTO>>> GetClanLeaderboard(string? timeframe, int? universityId, int? departmentId, int page, int pageSize);
        Task<ServiceResult<List<ClanDTO>>> GetTopClans(int count);
        Task<ServiceResult<List<ClanJoinRequestDTO>>> GetPendingJoinRequests(int clanId, int actorUserId);
        Task<ServiceResult<bool>> DecideJoinRequest(int clanId, int requestId, int actorUserId, bool approve);
        
        // Helper methods
        Task<Models.ClanMember?> GetUserClanMembership(int clanId, int userId);

        // Announcements
        Task<ServiceResult<List<ClanAnnouncementDTO>>> GetClanAnnouncements(int clanId, int? currentUserId, int page, int pageSize);
        Task<ServiceResult<ClanAnnouncementDTO>> CreateAnnouncement(int clanId, int userId, CreateAnnouncementDTO dto);
        Task<ServiceResult<bool>> ReactToAnnouncement(int announcementId, int userId, string emoji);
        Task<ServiceResult<bool>> RemoveAnnouncementReaction(int announcementId, int userId);

        // Community Posts  
        Task<ServiceResult<ClanPostDTO>> CreateClanPost(int clanId, int userId, CreateClanPostDTO dto);
        Task<ServiceResult<bool>> ReactToPost(int postId, int userId, string emoji);
        Task<ServiceResult<bool>> VoteOnPost(int postId, int userId, int vote);
    }
}
