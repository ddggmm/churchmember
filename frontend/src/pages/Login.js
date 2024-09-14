import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // useAuth import 추가

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // useAuth에서 login 함수 가져오기

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { 
        email: credentials.email, 
        password: credentials.password 
      });
      if (response.data.message === "로그인 성공") {
        login();
        navigate('/');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
        예수소망교회 등록현황
      </h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-96" role="form" aria-labelledby="login-title">
        <h2 id="login-title" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold py-4 px-6 text-center">
          로그인
        </h2>
        <form onSubmit={handleSubmit} className="p-6">
          {/* 이메일 입력 필드 */}
          <div className="mb-4">
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="이메일"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="이메일 주소"
            />
          </div>
          {/* 비밀번호 입력 필드 */}
          <div className="mb-4">
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="비밀번호"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="비밀번호"
            />
          </div>
          {/* 로그인 상태 유지 체크박스 */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={handleRememberMe}
              className="mr-2"
              aria-describedby="rememberMe-description"
            />
            <label htmlFor="rememberMe" id="rememberMe-description" className="text-sm text-gray-600">로그인 상태 유지</label>
          </div>
          {/* 로그인 버튼 */}
          <div className="mt-6 flex justify-center">
            <button 
              type="submit" 
              className="px-8 py-2 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="로그인 버튼"
            >
              로그인
            </button>
          </div>
        </form>
        {/* 회원가입 링크 */}
        <div className="bg-gray-50 px-6 py-4 text-center">
          <Link 
            to="/signup" 
            className="inline-block px-6 py-2 border border-transparent text-lg font-medium rounded-md text-blue-400 bg-blue-100 hover:bg-blue-200"
            aria-label="신규회원가입 페이지로 이동"
          >
            신규회원가입
          </Link>
        </div>
        {/* 오류 메시지 표시 */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      </div>
    </div>
  );
}

export default Login;