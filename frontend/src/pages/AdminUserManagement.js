import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function AdminUserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('사용자 목록 불러오기 실패:', error);
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId, newRole) => {
    try {
      setError(null);
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error('역할 업데이트 실패:', error);
      setError('역할 업데이트에 실패했습니다.');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        setError(null);
        await axios.delete(`/api/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('사용자 삭제 실패:', error);
        setError('사용자 삭제에 실패했습니다.');
      }
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">사용자 관리</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">로딩 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">오류!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">이메일</th>
              <th className="border border-gray-300 p-2">역할</th>
              <th className="border border-gray-300 p-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{u.id}</td>
                <td className="border border-gray-300 p-2">{u.email}</td>
                <td className="border border-gray-300 p-2">{u.role}</td>
                <td className="border border-gray-300 p-2">
                  {user.role === 'SUPER_ADMIN' && (
                    <>
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        className="mr-2 p-1 border rounded"
                      >
                        <option value="USER">일반 사용자</option>
                        <option value="ADMIN">관리자</option>
                        <option value="SUPER_ADMIN">최고 관리자</option>
                      </select>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUserManagement;
