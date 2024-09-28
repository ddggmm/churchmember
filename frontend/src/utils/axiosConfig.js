import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await instance.post('/api/auth/refresh', {}, {
          headers: { 'Authorization': `Bearer ${refreshToken}` }
        });
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        error.config.headers['Authorization'] = `Bearer ${access_token}`;
        return instance(error.config);
      } catch (refreshError) {
        // 리프레시 토큰이 만료되었거나 유효하지 않은 경우
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
