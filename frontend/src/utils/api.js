import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMembers = async () => {
  try {
    const response = await api.get('/members');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '회원가입에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const testRouteGet = async () => {
  try {
    const response = await api.get('/test');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const testRoutePost = async () => {
  try {
    const response = await api.post('/test', {});
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default api;