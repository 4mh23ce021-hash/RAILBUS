import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('railbus_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      const activeToken = localStorage.getItem('railbus_admin_token') || token;
      if (!activeToken) {
        setAdmin(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${activeToken}`
          }
        });
        if (res.data?.user && res.data.user.role === 'ADMIN') {
          setAdmin(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Admin auth verification failed:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }
    loadAdmin();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('railbus_admin_token', res.data.token);
      setToken(res.data.token);
      setAdmin(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('railbus_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: !!admin,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
