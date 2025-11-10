import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from './services/userService';
import { logout as logoutService } from './services/authService';

export const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (err) {
      localStorage.removeItem('user');
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const login = (userData, tokenData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (tokenData) {
      setToken(tokenData);
      localStorage.setItem('token', tokenData);
      localStorage.removeItem('authToken');
    }
  };

  // Add updateUser function for real-time updates
  const updateUser = (updates) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const updatedUser = {
        ...prevUser,
        ...updates
      };
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear React state
    setUser(null);
    setToken(null);

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
  };

  useEffect(() => {
    const validateUser = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (savedUser && savedToken) {
        try {
          // First set the saved user data
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Then validate with the server
          const userData = await getCurrentUser();
          if (userData.status && userData.user) {
            // Update with fresh data from server
            setUser(userData.user);
            localStorage.setItem('user', JSON.stringify(userData.user));
            localStorage.removeItem('authToken');
          } else {
            throw new Error('Invalid user data from API');
          }
        } catch (err) {
          console.error('User validation error:', err);
          
          // Handle 401 unauthorized error
          if (err.response && err.response.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
          } else {
            // Clear data on other errors
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
          }
        }
      }
    };

    validateUser();
  }, []);

  // Provide refreshUser function to manually refresh user data
  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData.status && userData.user) {
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Refresh user error:', err);
      if (err.response?.status === 401) {
        logout();
      }
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      updateUser,
      refreshUser,
      setUser
    }}>
      {children}
    </UserContext.Provider>
  );
};