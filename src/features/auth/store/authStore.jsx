/**
 * Auth Store
 * Centralized state management for authentication
 * Uses React Context API for state management
 */

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    return !!(storedToken && storedUser);
  });

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);


  // Update isAuthenticated when user or token changes
  useEffect(() => {
    setIsAuthenticated(!!(token && user?.id));
  }, [token, user]);

  // Login function
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lang');
  };

  // Update user function
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Select workspace function
  const selectWorkspace = (workspaceId) => {
    setSelectedWorkspace(workspaceId);
  };

  const value = {
    // State
    user,
    token,
    selectedWorkspace,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    updateUser,
    selectWorkspace,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

