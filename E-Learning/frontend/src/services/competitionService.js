import api from './api';

export const competitionService = {
  async getAllCompetitions(page = 1, pageSize = 20) {
    const response = await api.get('/competitions', { params: { page, pageSize } });
    return response.data.data;
  },

  async getCompetitionById(id) {
    const response = await api.get(`/competitions/${id}`);
    return response.data.data;
  },

  async getLeaderboard(competitionId) {
    const response = await api.get(`/competitions/${competitionId}/leaderboard`);
    return response.data.data;
  },

  async participateInCompetition(id) {
    const response = await api.post(`/competitions/${id}/participate`);
    return response.data;
  },

  async submitCompetitionScore(competitionId, scoreData) {
    const response = await api.post(`/competitions/${competitionId}/score`, scoreData);
    return response.data;
  },

  async getRankings() {
    const response = await api.get('/rankings');
    return response.data.data;
  }
};
