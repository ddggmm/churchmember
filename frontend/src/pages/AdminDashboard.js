import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminDashboard() {
  const { user } = useAuth();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">관리자 대시보드</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600 text-center"
        >
          사용자 관리
        </Link>
        <Link
          to="/admin/members"
          className="bg-green-500 text-white p-4 rounded hover:bg-green-600 text-center"
        >
          회원 관리
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
