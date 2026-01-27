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
    // Endpoint expects lessonId in path and enrollmentId as query
    try {
      const response = await api.post(`/learning/lesson/${lessonId}/complete`, null, { params: { enrollmentId } });
      return response.data;
    } catch (err) {
      // fallback: some clients call enrollments complete-lesson endpoint — try that as a fallback
      try {
        const fallback = await api.post(`/enrollments/${enrollmentId}/complete-lesson/${lessonId}`);
        return fallback.data;
      } catch (err2) {
        throw err; // prefer original error
      }
    }
  },

  async watchLesson(lessonId, enrollmentId, watchedSeconds) {
    const response = await api.post(`/learning/lesson/${lessonId}/watch`, { watchedSeconds }, { params: { enrollmentId } });
    return response.data;
  },

  async getLesson(lessonId) {
    const response = await api.get(`/learning/lesson/${lessonId}`);
    // Backend sometimes returns { success: true, lesson: {...} }
    // some older clients expect response.data.data — support both
    return response.data?.lesson ?? response.data?.data ?? response.data;
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
