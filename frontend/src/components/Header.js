import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaUserCog } from 'react-icons/fa';

function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="p-4 bg-gray-100">
      <div className="container mx-auto">
        <div className="flex flex-col items-center">
          <Link to="/" className="mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text hover:opacity-80 transition-opacity">
              예수소망교회 등록현황
            </h1>
          </Link>
          <nav className="flex justify-center items-center space-x-4 mb-4">
            <Link to="/" className="flex items-center hover:text-blue-500">
              <FaHome className="mr-1" /> 홈
            </Link>
            <Link to="/member-registration" className="hover:text-blue-500">신규등록</Link>
            <Link to="/edit" className="hover:text-blue-500">등록수정</Link>
            <Link to="/members" className="hover:text-blue-500">목록보기</Link>
            {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
              <Link to="/admin/users" className="flex items-center hover:text-blue-500">
                <FaUserCog className="mr-1" /> 사용자 관리
              </Link>
            )}
            {isLoggedIn ? (
              <button onClick={handleLogout} className="hover:text-blue-500">로그아웃</button>
            ) : (
              <Link to="/login" className="hover:text-blue-500">로그인</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;