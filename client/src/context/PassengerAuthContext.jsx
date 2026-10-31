import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const PassengerAuthContext = createContext(null);

export function PassengerAuthProvider({ children }) {
  const [passenger, setPassenger] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('railbus_passenger_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const activeToken = localStorage.getItem('railbus_passenger_token') || token;
      if (!activeToken) {
        setPassenger(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        if (res.data?.user && (res.data.user.role === 'PASSENGER' || res.data.user.role === 'ADMIN')) {
          setPassenger(res.data.user);
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
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/passenger/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('railbus_passenger_token', res.data.token);
      setToken(res.data.token);
      setPassenger(res.data.user);
      return res.data;
    }
  };

  const register = async ({ name, email, phone, password }) => {
    const res = await api.post('/auth/passenger/register', { name, email, phone, password });
    if (res.data?.token) {
      localStorage.setItem('railbus_passenger_token', res.data.token);
      setToken(res.data.token);
      setPassenger(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('railbus_passenger_token');
    setToken(null);
    setPassenger(null);
  };

  return (
    <PassengerAuthContext.Provider
      value={{
        passenger,
        token,
        loading,
        isAuthenticated: !!passenger,
        login,
        register,
        logout
      }}
    >
      {children}
    </PassengerAuthContext.Provider>
  );
}

export function usePassengerAuth() {
  const context = useContext(PassengerAuthContext);
  if (!context) {
    throw new Error('usePassengerAuth must be used within a PassengerAuthProvider');
  }
  return context;
}
