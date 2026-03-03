using backend.DTOs;

namespace backend.Services.Interfaces
{
    public interface IClanCompetitionScoringService
    {
        Task<ServiceResult<ClanCompetitionFinalizeResultDTO>> FinalizeCompetitionAndUpdateLeaderboard(int competitionId, int adminUserId);
        Task<ServiceResult<List<CompetitionLeaderboardEntryDTO>>> GetTeamLeaderboard(int competitionId);
        Task<ServiceResult<List<ClanLeaderboardEntryDTO>>> GetClanLeaderboard(int competitionId);
        Task<ServiceResult<List<SeasonalClanRankingEntryDTO>>> GetSeasonalClanRanking(int season);
    }
}
