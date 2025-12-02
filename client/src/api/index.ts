import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add user_id to headers if user is logged in
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    config.headers['x-user-id'] = user.user_id;
  }
  return config;
});

export default api;

