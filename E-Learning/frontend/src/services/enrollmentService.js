import api from './api';

export const enrollmentService = {
  async getUserEnrollments(page = 1, pageSize = 20) {
    const response = await api.get('/enrollments', { params: { page, pageSize } });
    return response.data.data;
  },

  async getEnrollment(id) {
    const response = await api.get(`/enrollments/${id}`);
    return response.data.data;
  },

  async enrollInCourse(courseId) {
    const response = await api.post(`/enrollments/enroll/${courseId}`);
    return response.data;
  },

  async unenrollFromCourse(courseId) {
    const response = await api.post(`/enrollments/unenroll/${courseId}`);
    return response.data;
  },

  async getProgress(enrollmentId) {
    const response = await api.get(`/enrollments/${enrollmentId}/progress`);
    return response.data.data;
  },

  async completeLesson(enrollmentId, lessonId) {
    const response = await api.post(`/enrollments/${enrollmentId}/complete-lesson/${lessonId}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/enrollments/stats');
    return response.data.data;
  }
};
