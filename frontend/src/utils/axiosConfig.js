import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // 서버가 2xx 범위를 벗어나는 상태 코드로 응답한 경우
      console.error('Response error:', error.response.data);
      // 여기에서 에러 메시지를 사용자에게 표시하는 로직을 추가할 수 있습니다.
    } else if (error.request) {
      // 요청이 이루어졌으나 응답을 받지 못한 경우
      console.error('Request error:', error.request);
    } else {
      // 요청을 설정하는 중에 오류가 발생한 경우
      console.error('Error:', error.message);
    }

    // 기존의 토큰 갱신 로직
    if (error.response && error.response.status === 401 && !error.config._retry && error.config.url !== '/api/auth/check') {
      error.config._retry = true;
      try {
        await instance.post('/api/auth/refresh');
        return instance(error.config);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
