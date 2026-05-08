import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      // 401 is expected when not logged in — only log unexpected errors
      if (err.response?.status !== 401) {
        console.error('Auth check failed', err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.result);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      const res = await api.post('/auth/register', { username, email, password });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      // Force redirect to login page after logout
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed', err);
      // Even if API fails, clear local user and redirect
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, login, register, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
