import { apiFetch } from './client';

export const competitionService = {
  getCompetitions: (page = 1, pageSize = 20) =>
    apiFetch(`/competitions?page=${page}&pageSize=${pageSize}`, { auth: false }),
  registerTeam: (competitionId, teamId) =>
    apiFetch(`/competitions/register-team`, {
      method: 'POST',
      body: { competitionId, teamId },
      auth: true,
    }),
};
