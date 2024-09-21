import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials.email, credentials.password);
      navigate('/');
    } catch (error) {
      console.error('로그인 오류:', error);
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-100 py-4">
        {/* 헤더 내용이 필요하다면 여기에 추가 */}
      </header>
      <main className="flex-grow bg-white flex flex-col items-center justify-start pt-20">
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-96">
          <h2 className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold py-4 px-6 text-center">
            로그인
          </h2>
          <form onSubmit={handleSubmit} className="p-6">
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
          <div className="bg-gray-50 px-6 py-4 text-center">
            <Link 
              to="/signup" 
              className="inline-block px-6 py-2 border border-transparent text-lg font-medium rounded-md text-blue-400 bg-blue-100 hover:bg-blue-200"
              aria-label="신규회원가입 페이지로 이동"
            >
              신규회원가입
            </Link>
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        </div>
      </main>
    </div>
  );
}

export default Login;