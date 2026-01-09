export const constants = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5145/api',
  
  ROLES: {
    STUDENT: 'Student',
    TEACHER: 'Teacher',
    ADMIN: 'Admin'
  },

  COURSE_DIFFICULTY: {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced'
  },

  ENROLLMENT_STATUS: {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    DROPPED: 'Dropped'
  },

  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
  }
};
