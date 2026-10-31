import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach role-specific JWT
api.interceptors.request.use(
  (config) => {
    // If authorization header is already explicitly provided, preserve it
    if (config.headers?.Authorization) {
      return config;
    }

    let token = null;
    const url = config.url || '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    if (currentPath.startsWith('/admin') || url.includes('/admin/')) {
      token = localStorage.getItem('railbus_admin_token');
    } else if (currentPath.startsWith('/conductor') || url.includes('/conductor/')) {
      token = localStorage.getItem('railbus_conductor_token');
    } else if (currentPath.startsWith('/passenger') || url.includes('/passenger/')) {
      token = localStorage.getItem('railbus_passenger_token');
    } else {
      // General or public routes: fallback to any active token
      token = localStorage.getItem('railbus_passenger_token') ||
              localStorage.getItem('railbus_admin_token') ||
              localStorage.getItem('railbus_conductor_token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error handling & session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const code = error.response.data?.code;
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const url = error.config?.url || '';

      if (code === 'TOKEN_EXPIRED') {
        if (currentPath.startsWith('/admin') || url.includes('/admin/')) {
          localStorage.removeItem('railbus_admin_token');
          window.location.href = '/admin/login?expired=1';
        } else if (currentPath.startsWith('/conductor') || url.includes('/conductor/')) {
          localStorage.removeItem('railbus_conductor_token');
          window.location.href = '/conductor/login?expired=1';
        } else {
          localStorage.removeItem('railbus_passenger_token');
          window.location.href = '/passenger/login?expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
