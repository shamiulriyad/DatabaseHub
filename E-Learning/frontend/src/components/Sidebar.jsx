import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        {user.role === 'Student' && (
          <>
            <Link to="/dashboard" className="sidebar-link">📊 My Dashboard</Link>
            <Link to="/enrollments" className="sidebar-link">📖 My Courses</Link>
            <Link to="/assignments" className="sidebar-link">✏️ Assignments</Link>
            <Link to="/quizzes" className="sidebar-link">📝 Quizzes</Link>
            <Link to="/profile" className="sidebar-link">👤 Profile</Link>
          </>
        )}

        {user.role === 'Teacher' && (
          <>
            <Link to="/dashboard" className="sidebar-link">📊 Dashboard</Link>
            <Link to="/courses/create" className="sidebar-link">➕ Create Course</Link>
            <Link to="/my-courses" className="sidebar-link">📚 My Courses</Link>
            <Link to="/grading" className="sidebar-link">✅ Grading</Link>
            <Link to="/profile" className="sidebar-link">👤 Profile</Link>
          </>
        )}

        {user.role === 'Admin' && (
          <>
            <Link to="/admin/dashboard" className="sidebar-link">📊 Dashboard</Link>
            <Link to="/admin/users" className="sidebar-link">👥 Users</Link>
            <Link to="/admin/courses" className="sidebar-link">📚 Courses</Link>
            <Link to="/admin/payments" className="sidebar-link">💳 Payments</Link>
            <Link to="/admin/settings" className="sidebar-link">⚙️ Settings</Link>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
