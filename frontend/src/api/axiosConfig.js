import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Interceptor to add the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwt_token');
      // Redirecting outside of React Router component scope is tricky,
      // but reloading will force the protected routes to kick them out
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;