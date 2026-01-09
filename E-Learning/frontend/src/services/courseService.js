import api from './api';

export const courseService = {
  async getAllCourses(page = 1, pageSize = 20) {
    const response = await api.get('/courses', { params: { page, pageSize } });
    return response.data.data;
  },

  async getCourseById(id) {
    const response = await api.get(`/courses/${id}`);
    return response.data.data;
  },

  async createCourse(courseData) {
    const response = await api.post('/courses', courseData);
    return response.data.data;
  },

  async updateCourse(id, courseData) {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data.data;
  },

  async deleteCourse(id) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  async searchCourses(query) {
    const response = await api.get('/courses/search', { params: { q: query } });
    return response.data.data;
  }
};
