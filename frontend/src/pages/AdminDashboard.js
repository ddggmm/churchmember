import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUsers, FaChurch } from 'react-icons/fa';

function AdminDashboard() {
  const { user } = useAuth();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">관리자 대시보드</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link to="/admin/users" className="block p-6 bg-blue-100 rounded-lg hover:bg-blue-200 transition duration-300 shadow-md">
          <div className="flex items-center justify-center mb-4">
            <FaUsers className="text-4xl text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">사용자 관리</h2>
          <p className="text-center text-gray-600">사용자 계정 및 권한을 관리합니다.</p>
        </Link>
        <Link to="/members" className="block p-6 bg-green-100 rounded-lg hover:bg-green-200 transition duration-300 shadow-md">
          <div className="flex items-center justify-center mb-4">
            <FaChurch className="text-4xl text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">회원 관리</h2>
          <p className="text-center text-gray-600">교회 회원 정보를 관리합니다.</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
