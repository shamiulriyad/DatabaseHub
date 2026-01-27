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

  async createCompetition(data) {
    const response = await api.post('/competitions', data);
    return response.data;
  },

  async updateCompetition(id, data) {
    const response = await api.put(`/competitions/${id}`, data);
    return response.data;
  },

  async deleteCompetition(id) {
    const response = await api.delete(`/competitions/${id}`);
    return response.data;
  },

  async joinCompetition(id) {
    const response = await api.post(`/competitions/${id}/join`);
    return response.data;
  },

  async leaveCompetition(id) {
    const response = await api.post(`/competitions/${id}/leave`);
    return response.data;
  },

  async getLeaderboard(competitionId, page = 1, pageSize = 20) {
    const response = await api.get(`/competitions/${competitionId}/leaderboard`, {
      params: { page, pageSize }
    });
    return response.data.data;
  },

  async getStats(competitionId) {
    const response = await api.get(`/competitions/${competitionId}/stats`);
    return response.data.data;
  },

  async getUserCompetitions() {
    const response = await api.get('/competitions/user/my-competitions');
    return response.data.data;
  },

  // NEW: Codeforces-style question endpoints
  
  /**
   * Get questions for admin/creator (anytime access)
   * @param {number} competitionId 
   */
  async getAdminQuestions(competitionId) {
    const response = await api.get(`/competitions/${competitionId}/admin/questions`);
    return response.data;
  },

  /**
   * Get questions for participant (ONLY during Ongoing status)
   * @param {number} competitionId 
   */
  async getParticipantQuestions(competitionId) {
    const response = await api.get(`/competitions/${competitionId}/participant/questions`);
    return response.data;
  }

  ,

  async submitAnswers(competitionId, dto) {
    const response = await api.post(`/competitions/${competitionId}/submit-answers`, dto);
    return response.data;
  }
};

export default competitionService;
