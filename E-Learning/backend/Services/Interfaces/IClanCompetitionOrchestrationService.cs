using backend.DTOs;

namespace backend.Services.Interfaces
{
    public interface IClanCompetitionOrchestrationService
    {
        Task<ServiceResult<CompetitionDTO>> CreateAdminClanCompetition(CreateClanCompetitionDTO dto, int adminUserId);
        Task<ServiceResult<List<ClanLeaderboardEntryDTO>>> GetClanRanking();
        Task<ServiceResult<List<ClanTeamSuggestionDTO>>> GenerateTeamSuggestions(int competitionId, int adminUserId, GenerateTeamSuggestionsDTO? policy = null);
        Task<ServiceResult<TeamSuggestionSummaryDTO>> GetTeamSuggestionSummary(int competitionId);
        Task<ServiceResult<TeamSuggestionSummaryDTO>> ApplyTeamSuggestionOverride(int competitionId, int adminUserId, ApplyTeamSuggestionOverrideDTO dto);
        Task<ServiceResult<List<CompetitionTeamOverviewEntryDTO>>> GetCompetitionTeamOverview(int competitionId);
        Task<ServiceResult<List<ClanMemberActivityEntryDTO>>> GetClanMemberActivity(int competitionId);
        Task<ServiceResult<CompetitionDashboardDTO>> GetCompetitionDashboard(int competitionId);
        Task<ServiceResult<List<ClanTypePerformanceEntryDTO>>> GetClanPerformanceByCompetitionType(string competitionType, int take = 20);
    }
}
