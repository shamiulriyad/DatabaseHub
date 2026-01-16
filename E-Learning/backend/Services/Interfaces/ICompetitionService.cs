using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface ICompetitionService
    {
        Task<ServiceResult<CompetitionDTO>> CreateCompetition(CreateCompetitionDTO dto, int userId);
        Task<ServiceResult<CompetitionDTO>> GetCompetitionById(int competitionId);
        Task<ServiceResult<List<CompetitionQuestionDTO>>> GetCompetitionQuestions(int competitionId);
       
        Task<ServiceResult<List<CompetitionQuestionDTO>>> GetAdminQuestions(int competitionId, int userId);
        Task<ServiceResult<List<CompetitionQuestionDTO>>> GetParticipantQuestions(int competitionId, int userId);
        Task<ServiceResult<List<CompetitionDTO>>> GetAllCompetitions(int page, int pageSize);
        Task<ServiceResult<CompetitionDTO>> UpdateCompetition(int competitionId, UpdateCompetitionDTO dto);
        Task<ServiceResult<bool>> DeleteCompetition(int competitionId);
        Task<ServiceResult<bool>> JoinCompetition(int competitionId, int userId);
        Task<ServiceResult<bool>> LeaveCompetition(int competitionId, int userId);
        Task<ServiceResult<CompetitionLeaderboardDTO>> GetCompetitionLeaderboard(int competitionId, int page, int pageSize);
        Task<ServiceResult<List<CompetitionDTO>>> GetUserCompetitions(int userId);
        Task<ServiceResult<CompetitionStatsDTO>> GetCompetitionStats(int competitionId);
        Task<ServiceResult<List<PendingCompetitionDTO>>> GetPendingCompetitions(int page, int pageSize);
        Task<ServiceResult<List<CompetitionDTO>>> GetAllCompetitionsForAdmin(int page, int pageSize);
        Task<ServiceResult<CompetitionDTO>> ApproveCompetition(int competitionId, int adminId);
        Task<ServiceResult<bool>> RejectCompetition(int competitionId, int adminId);
    }
}
