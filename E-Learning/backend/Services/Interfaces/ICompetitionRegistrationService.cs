using backend.DTOs;

namespace backend.Services.Interfaces
{
    public interface ICompetitionRegistrationService
    {
        Task<ServiceResult<bool>> RegisterTeam(CompetitionRegisterTeamDTO dto, int actorUserId);
    }
}
