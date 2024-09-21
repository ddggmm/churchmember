import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../utils/axiosConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { user } = response.data;
      setUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('isLoggedIn');
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      try {
        const response = await axios.get('/api/auth/check');
        if (response.data.isLoggedIn) {
          setUser(response.data.user);
          setIsLoggedIn(true);
        } else {
          throw new Error('Not logged in');
        }
      } catch (error) {
        console.error('인증 확인 실패:', error);
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}