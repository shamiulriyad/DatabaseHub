import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from '../Teacher/TeacherDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const activeRole = localStorage.getItem('activeRole');

  // Show appropriate dashboard based on role without redirecting
  // This preserves browser history and allows back button to work
  if (user?.isAdmin) {
    return <AdminDashboard />;
  } else if (user?.isTeacher && activeRole === 'teacher') {
    // If user is a teacher and selected teacher role, show TeacherDashboard
    return <TeacherDashboard />;
  } else {
    // Both pure students and teacher+student users (in student mode) see StudentDashboard here
    return <StudentDashboard />;
  }
};

export default Dashboard;
