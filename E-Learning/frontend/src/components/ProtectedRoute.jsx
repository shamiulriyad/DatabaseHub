import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  requiredAdmin = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check for admin requirement
  if (requiredAdmin && !user.isAdmin) {
    return <Navigate to="/" />;
  }

  // Check for specific role requirement
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
