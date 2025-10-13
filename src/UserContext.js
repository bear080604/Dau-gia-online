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
      console.error('Invalid user data in localStorage:', err);
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
      // Xóa authToken nếu tồn tại để tránh xung đột
      localStorage.removeItem('authToken');
    }
  };

  const logout = async () => {
    console.log('Before logout:', { user, token, authToken: localStorage.getItem('authToken') });
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken'); // Thêm dòng này để xóa authToken
    console.log('After logout:', {
      localStorageToken: localStorage.getItem('token'),
      localStorageAuthToken: localStorage.getItem('authToken')
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Logout API failed:', response.status);
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

          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
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
              localStorage.removeItem('authToken'); // Xóa authToken nếu tồn tại
            } else {
              throw new Error('Invalid user data from API');
            }
          } else if (response.status === 401) {
            console.warn('Session expired (401)');
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('authToken'); // Xóa authToken nếu token hết hạn
          }
        } catch (err) {
          console.error('Validation error:', err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken'); // Xóa authToken nếu có lỗi
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