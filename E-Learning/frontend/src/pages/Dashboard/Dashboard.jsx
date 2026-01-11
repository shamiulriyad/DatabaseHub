import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Show appropriate dashboard based on role without redirecting
  // This preserves browser history and allows back button to work
  if (user?.isAdmin) {
    return <AdminDashboard />;
  } else {
    // Both pure students and teacher+student users see StudentDashboard here
    return <StudentDashboard />;
  }
};

export default Dashboard;
