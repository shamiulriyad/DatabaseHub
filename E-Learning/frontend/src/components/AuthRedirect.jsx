import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * AuthRedirect component
 * - If user is logged in and on "/" (LandingPage), redirect to "/home"
 * - Allows logged-out users to see LandingPage
 */
const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // User is logged in, redirect to Home
      navigate('/home', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  // Only render children if user is NOT logged in
  return user ? null : children;
};

export default AuthRedirect;
