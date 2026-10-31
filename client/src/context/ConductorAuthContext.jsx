import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ConductorAuthContext = createContext(null);

export function ConductorAuthProvider({ children }) {
  const [conductor, setConductor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('railbus_conductor_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConductor() {
      const activeToken = localStorage.getItem('railbus_conductor_token') || token;
      if (!activeToken) {
        setConductor(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        if (res.data?.user && (res.data.user.role === 'CONDUCTOR' || res.data.user.role === 'ADMIN')) {
          setConductor(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }
    loadConductor();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/conductor/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('railbus_conductor_token', res.data.token);
      setToken(res.data.token);
      setConductor(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('railbus_conductor_token');
    setToken(null);
    setConductor(null);
  };

  return (
    <ConductorAuthContext.Provider
      value={{
        conductor,
        token,
        loading,
        isAuthenticated: !!conductor,
        login,
        logout
      }}
    >
      {children}
    </ConductorAuthContext.Provider>
  );
}

export function useConductorAuth() {
  const context = useContext(ConductorAuthContext);
  if (!context) {
    throw new Error('useConductorAuth must be used within a ConductorAuthProvider');
  }
  return context;
}
