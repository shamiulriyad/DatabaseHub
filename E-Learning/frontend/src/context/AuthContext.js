import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = useCallback(() => {
    try {
      const storedUser = authService.getUser();
      const token = authService.getToken();
      
      console.log('AuthContext: Initializing...', { 
        hasToken: !!token, 
        storedUser: storedUser ? {
          id: storedUser.id,
          username: storedUser.username,
          email: storedUser.email,
          isStudent: storedUser.isStudent,
          isTeacher: storedUser.isTeacher,
          isAdmin: storedUser.isAdmin
        } : null
      });
      
      // Only set user if both token and user exist
      if (storedUser && token) {
        // Immediately restore user from localStorage
        // This prevents logout on page refresh
        setUser(storedUser);
        // ensure legacy `userId` key exists for components reading localStorage directly
        try {
          if (storedUser && storedUser.id) {
            localStorage.setItem('userId', String(storedUser.id));
          }
        } catch (e) {
          // ignore
        }
        
        // Verify token is still valid by calling profile endpoint
        // But don't wait for it - just update the state if it fails
        api.get('/auth/profile')
          .then(response => {
            console.log('AuthContext: Token verified successfully');
            // Update user with latest data from server if available
            if (response.data.user) {
              setUser(response.data.user);
            }
          })
          .catch(error => {
            console.log('AuthContext: Token invalid or expired', error.response?.status);
            // Token is invalid, clear auth
            authService.logout();
            setUser(null);
          });
      } else {
        console.log('AuthContext: Missing token or user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    
    initializeAuth();

   
    const handleAuthLogout = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth-logout', handleAuthLogout);

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeAuth]);

  const login = async (email, password) => {
    console.log('AuthContext: Login started');
    const response = await authService.login(email, password);
    console.log('AuthContext: Login response received:', response);
    
    if (response.user) {
      console.log('AuthContext: Setting user state:', response.user);
      setUser(response.user);
      try {
        if (response.user && response.user.id) {
          localStorage.setItem('userId', String(response.user.id));
        }
      } catch (e) {
        // ignore
      }
      
      // Double check localStorage
      const storedUser = authService.getUser();
      console.log('AuthContext: Verified user in localStorage:', storedUser);
    } else {
      console.error('AuthContext: No user in response!');
    }
    
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
