import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Role: {user?.role}</p>

      {user?.role === 'Student' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Enrolled Courses</h3>
            <p className="stat">0</p>
          </div>
          <div className="dashboard-card">
            <h3>In Progress</h3>
            <p className="stat">0</p>
          </div>
          <div className="dashboard-card">
            <h3>Completed</h3>
            <p className="stat">0</p>
          </div>
          <div className="dashboard-card">
            <h3>Total Points</h3>
            <p className="stat">{user.totalPoints || 0}</p>
          </div>
        </div>
      )}

      {user?.role === 'Teacher' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>My Courses</h3>
            <p className="stat">0</p>
          </div>
          <div className="dashboard-card">
            <h3>Total Students</h3>
            <p className="stat">0</p>
          </div>
          <div className="dashboard-card">
            <h3>Pending Assignments</h3>
            <p className="stat">0</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
