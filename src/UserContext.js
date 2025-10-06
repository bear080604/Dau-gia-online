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
  console.log('🟢 UserProvider MOUNTED!');
  
  // Initialize from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      console.log('👤 Initial user from localStorage:', parsed);
      return parsed;
    } catch (err) {
      console.error('❌ Invalid user data in localStorage:', err);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    console.log('🔑 Initial token from localStorage:', savedToken ? '✅ exists' : '❌ missing');
    return savedToken || null;
  });

  console.log('👤 Current user state:', user);
  console.log('🔑 Current token:', token ? '✅ exists' : '❌ missing');

  // Login function - save both user and token
  const login = (userData, tokenData) => {
    console.log('🔐 Login called with:', { userData, hasToken: !!tokenData });
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (tokenData) {
      setToken(tokenData);
      localStorage.setItem('token', tokenData);
    }
  };

  // Logout function
  const logout = async () => {
    console.log('🚪 Logout called');
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('❌ Logout API failed:', response.status);
      } else {
        console.log('✅ Logout API success');
      }
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  };

  // Validate stored user on mount (optional - can be removed if causing issues)
  useEffect(() => {
    const validateUser = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      // If no user or token in localStorage, skip validation
      if (!savedUser || !savedToken) {
        console.log('⚠️ No saved credentials found');
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('🔍 Validating user:', parsedUser);

        // User already set in initial state, no need to set again
        
        // Optional: Validate with server (only if you have /user endpoint)
        try {
          const apiUrl = process.env.REACT_APP_API_URL;
          const response = await fetch(`${apiUrl}user`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${savedToken}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();
            console.log('✅ Server validation success:', userData);
            
            // Update if server returns different data
            if (JSON.stringify(userData) !== JSON.stringify(parsedUser)) {
              console.log('🔄 Updating user from server');
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } else if (response.status === 401) {
            // Only clear if 401 (unauthorized)
            console.warn('⚠️ Session expired (401) - logging out');
            logout();
          } else {
            console.warn('⚠️ Server validation failed:', response.status, '- keeping local user');
          }
        } catch (apiError) {
          console.error('❌ API validation failed, keeping localStorage user:', apiError);
          // Keep user from localStorage on network error
        }
      } catch (parseError) {
        console.error('❌ Failed to parse user from localStorage:', parseError);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    };

    validateUser();
  }, []); // Only run once on mount

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};