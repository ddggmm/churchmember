import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { access_token } = response.data;
          localStorage.setItem('accessToken', access_token);
          instance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          return instance(originalRequest);
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
          // 로그아웃 처리
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else if (error.response.status === 403) {
        console.error('접근 권한이 없습니다:', error.response.data);
        // 권한 없음 페이지로 리다이렉트 또는 알림 표시
      } else if (error.response.status === 500) {
        console.error('서버 오류가 발생했습니다:', error.response.data);
        // 서버 오류 알림 표시
      }
    } else if (error.request) {
      console.error('서버로부터 응답이 없습니다:', error.request);
      // 네트워크 오류 알림 표시
    } else {
      console.error('요청 설정 중 오류가 발생했습니다:', error.message);
    }
    return Promise.reject(error);
  }
);

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
