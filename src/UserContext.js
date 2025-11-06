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

  const logout = async () => {
    // Gọi API đăng xuất trước
    try {
      await logoutService();
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Xóa dữ liệu trong state React
    setUser(null);
    setToken(null);

    // Xóa trong localStorage
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
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          const userData = await getCurrentUser();
          if (userData.status && userData.user) {
            setUser(userData.user);
            localStorage.setItem('user', JSON.stringify(userData.user));
            localStorage.removeItem('authToken');
          } else {
            throw new Error('Invalid user data from API');
          }
        } catch (err) {
          // Xử lý lỗi 401 hoặc lỗi khác
          if (err.response && err.response.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
          } else {
            // Xóa dữ liệu nếu có lỗi khác
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

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};