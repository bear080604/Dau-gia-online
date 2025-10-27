import React, { createContext, useState, useContext, useEffect } from 'react';

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
    // Xóa dữ liệu trong state React
    setUser(null);
    setToken(null);

    // Xóa trong localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');

    // Gọi API đăng xuất (nếu cần)
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'}logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('Logout API returned non-OK response');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    const validateUser = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (savedUser && savedToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          const response = await fetch(`${process.env.REACT_APP_API_URL}user`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${savedToken}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData.status && userData.user) {
              setUser(userData.user);
              localStorage.setItem('user', JSON.stringify(userData.user));
              localStorage.removeItem('authToken');
            } else {
              throw new Error('Invalid user data from API');
            }
          } else if (response.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
          }
        } catch (err) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
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