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
  },
 
  async getCourseProgress(courseId) {
    // Backend exposes progress under enrollments controller: /enrollments/course/{courseId}/progress
    const response = await api.get(`/enrollments/course/${courseId}/progress`);
    return response.data?.data || response.data;
  },

  // আরও ইউটিলিটি মেথডস যোগ করতে পারেন
  async enrollInCourse(courseId) {
    try {
      const response = await api.post(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  async submitRating(courseId, rating, review) {
    try {
      const response = await api.post(`/courses/${courseId}/ratings`, { rating, review });
      return response.data;
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  },

  async getCourseReviews(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/reviews`);
      return response.data?.reviews || response.data || [];
    } catch (error) {
      console.error('Error fetching course reviews:', error);
      return [];
    }
  },

  async getTeacherCourses(teacherId) {
    try {
      const response = await api.get(`/teachers/${teacherId}/courses`);
      return response.data?.courses || response.data || [];
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      return [];
    }
  },

  async updateLessonProgress(courseId, lessonId, progress) {
    try {
      const response = await api.post(`/courses/${courseId}/lessons/${lessonId}/progress`, {
        progress,
        completed: progress >= 100
      });
      return response.data;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  },

  async completeLesson(courseId, lessonId) {
    try {
      const response = await api.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  },

  async getCourseAnalytics(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      return null;
    }
  },

  async getRecommendedCourses() {
    try {
      const response = await api.get('/courses/recommended');
      return response.data?.courses || response.data || [];
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      return [];
    }
  }
};