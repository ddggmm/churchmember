import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function SignUp() {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const response = await axios.post('/api/auth/signup', userData);
      if (response.status === 201) {
        alert('회원가입이 완료되었습니다.');
        navigate('/login');
      } else {
        throw new Error('회원가입에 실패했습니다.');
      }
    } catch (error) {
      alert(error.response?.data?.message || '회원가입에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-96">
        <h2 className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold py-4 px-6 text-center">
          신규회원가입
        </h2>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
              placeholder="이메일"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              required
              placeholder="비밀번호"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="비밀번호 확인"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-6">
            <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              가입하기
            </button>
          </div>
        </form>
        <div className="bg-gray-50 px-6 py-4 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
            이미 계정이 있으신가요? 로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
