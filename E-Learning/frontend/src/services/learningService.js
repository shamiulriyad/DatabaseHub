import api from './api';

export const learningService = {
  async submitQuiz(enrollmentId, quizData) {
    const response = await api.post(`/learning/quiz/${enrollmentId}/submit`, quizData);
    return response.data;
  },

  async submitAssignment(enrollmentId, assignmentData) {
    const response = await api.post(`/learning/assignment/${enrollmentId}/submit`, assignmentData);
    return response.data;
  },

  async completeLesson(enrollmentId, lessonId) {
    const response = await api.post(`/learning/lesson/${enrollmentId}/${lessonId}/complete`);
    return response.data;
  },

  async getLesson(lessonId) {
    const response = await api.get(`/learning/lesson/${lessonId}`);
    return response.data.data;
  },

  async getQuiz(quizId) {
    const response = await api.get(`/learning/quiz/${quizId}`);
    return response.data.data;
  },

  async getAssignment(assignmentId) {
    const response = await api.get(`/learning/assignment/${assignmentId}`);
    return response.data.data;
  }
};
