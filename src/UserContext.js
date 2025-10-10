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
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}logout`, { // Thêm / nếu API prefix /api
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Logout API failed:', response.status);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Validate stored user on mount
useEffect(() => {
  const validateUser = async () => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        // ✅ Set user TRƯỚC KHI validate API
        setUser(parsedUser);

        // Optional: Validate với server (nếu có endpoint /user)
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}user`, {
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();
            // Update nếu server trả data khác
            if (JSON.stringify(userData) !== JSON.stringify(parsedUser)) {
              login(userData);
            }
          } else if (response.status === 401) {
            // ✅ CHỈ xóa nếu 401 (session thực sự hết hạn)
            console.warn('Session expired (401)');
            setUser(null);
            localStorage.removeItem('user');
          }
          // ✅ Với lỗi khác (500, 404, network) → GIỮ user từ localStorage
        } catch (apiError) {
          console.error('API validation failed, keeping localStorage user:', apiError);
          // Giữ user từ localStorage
        }
      } catch (parseError) {
        console.error('Failed to parse user from localStorage:', parseError);
        localStorage.removeItem('user');
      }
    }
  };

  validateUser();
}, []); // Chỉ chạy 1 lần khi mount

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
