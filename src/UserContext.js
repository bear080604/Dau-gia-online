import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

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
  const [isValidating, setIsValidating] = useState(false);
  const validationTimeoutRef = useRef(null);

  // Hàm clear timeout để tránh memory leak
  const clearValidationTimeout = () => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = null;
    }
  };

  // Chặn refresh và phím tắt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isValidating) {
        e.preventDefault();
        e.returnValue = 'Đang xác thực thông tin người dùng. Vui lòng chờ...';
        return 'Đang xác thực thông tin người dùng. Vui lòng chờ...';
      }
    };

    const handleKeyDown = (e) => {
      // Chặn Ctrl+R, Cmd+R, F5
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        if (isValidating) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Đang xác thực thông tin. Vui lòng chờ...');
          return false;
        }
      }
      
      if (e.key === 'F5') {
        if (isValidating) {
          e.preventDefault();
          return false;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
      clearValidationTimeout();
    };
  }, [isValidating]);

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
    // Dừng validation nếu đang chạy
    setIsValidating(false);
    clearValidationTimeout();

    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');

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

      // Nếu không có dữ liệu, không cần validate
      if (!savedUser || !savedToken) {
        return;
      }

      setIsValidating(true);

      // Timeout để tránh treo mãi nếu API không phản hồi
      validationTimeoutRef.current = setTimeout(() => {
        console.warn('User validation timeout');
        setIsValidating(false);
      }, 10000); // 10 giây timeout

      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Set user ngay lập tức từ localStorage để tránh flash
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
          // Token hết hạn
          console.log('Token expired, logging out...');
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
        } else {
          // Lỗi khác, vẫn giữ user từ localStorage
          console.warn('User validation failed but keeping local data');
        }
      } catch (err) {
        console.error('User validation error:', err);
        // Trong trường hợp lỗi mạng, vẫn giữ user từ localStorage
        // chỉ xóa khi có lỗi parse JSON hoặc lỗi nghiêm trọng
        if (err.name === 'SyntaxError') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } finally {
        clearValidationTimeout();
        setIsValidating(false);
      }
    };

    validateUser();
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isValidating 
    }}>
      {children}
    </UserContext.Provider>
  );
};