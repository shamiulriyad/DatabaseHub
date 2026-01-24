import api from './api';

export const courseService = {
  async getAllCourses(page = 1, pageSize = 20, filters = {}) {
    const params = { page, pageSize, ...filters };
    const response = await api.get('/courses', { params });
    // backend returns { success, courses, totalCount, ... }
    return response.data.courses || [];
  },

  async getCourseById(id) {
    const response = await api.get(`/courses/${id}`);
    // backend returns { success, course }
    return response.data.course || null;
  },

  async createCourse(courseData) {
    const response = await api.post('/courses', courseData);
    return response.data.course || response.data;
  },

  async updateCourse(id, courseData) {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data.course || response.data;
  },

  async deleteCourse(id) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  async searchCourses(query) {
    const response = await api.get('/courses/search', { params: { q: query } });
    return response.data.data;
  },

  async getPopularCourses() {
    const response = await api.get('/courses/popular');
    return response.data.courses || response.data || [];
  },

  async getTrendingCourses() {
    const response = await api.get('/courses/trending');
    return response.data.courses || response.data || [];
  },

  async getNewCourses() {
    const response = await api.get('/courses/new');
    return response.data.courses || response.data || [];
  }
};
