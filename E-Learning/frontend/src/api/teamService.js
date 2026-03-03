import { apiFetch } from './client';

async function unwrap(path, opts) {
  const res = await apiFetch(path, opts);
  // Backend responses are { success: bool, teams/members/team/message... }
  // Normalize to { data }
  if (res && typeof res === 'object') {
    if (res.teams !== undefined) return { data: res.teams };
    if (res.members !== undefined) return { data: res.members };
    if (res.team !== undefined) return { data: res.team };
    if (res.success !== undefined && Object.keys(res).length === 1) return { data: null };
  }
  return { data: res };
}

export const teamService = {
  getClanTeams: (clanId) => unwrap(`/clans/${clanId}/teams`, { auth: true }),
  getClanMembers: (clanId) => unwrap(`/clans/${clanId}/members`, { auth: true }),
  createTeam: async (clanId, name) => {
    const r = await apiFetch(`/clans/${clanId}/team/create`, {
      method: 'POST',
      body: { name, clanId },
      auth: true,
    });
    return { data: r?.team ?? r };
  },
  addMember: async (clanId, teamId, userId) => {
    const r = await apiFetch(`/clans/${clanId}/team/add-member`, {
      method: 'POST',
      body: { teamId, userId },
      auth: true,
    });
    return { data: r };
  },
  removeMember: async (clanId, teamId, userId) => {
    const r = await apiFetch(`/clans/${clanId}/team/remove-member`, {
      method: 'DELETE',
      body: { teamId, userId },
      auth: true,
    });
    return { data: r };
  },
};
