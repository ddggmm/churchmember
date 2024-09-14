import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true  // 쿠키를 포함하여 요청을 보냅니다.
});

export default instance;
