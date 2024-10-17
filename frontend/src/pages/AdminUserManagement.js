import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function AdminUserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'USER' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('사용자 목록 불러오기 실패:', error);
      if (error.response) {
        setError(`사용자 목록 불러오기 실패: ${error.response.data.message || error.response.data.error}`);
      } else if (error.request) {
        setError('서버 응답이 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        setError('요청 설정 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', newUser);
      setNewUser({ email: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (error) {
      setError('사용자 생성에 실패했습니다.');
    }
  };

  const handleUpdateUser = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (error) {
      setError('사용자 역할 변경에 실패했습니다.');
    }
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">사용자 관리</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <form onSubmit={handleCreateUser} className="mb-8">
        <h3 className="text-xl font-semibold mb-2">새 사용자 추가</h3>
        <input
          type="email"
          placeholder="이메일"
          value={newUser.email}
          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          className="border p-2 mr-2"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={newUser.password}
          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
          className="border p-2 mr-2"
          required
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
          className="border p-2 mr-2"
        >
          <option value="USER">일반 사용자</option>
          <option value="ADMIN">관리자</option>
          <option value="SUPER_ADMIN">최고 관리자</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">추가</button>
      </form>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">이메일</th>
            <th className="p-2">역할</th>
            <th className="p-2">작업</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">
                <select
                  value={user.role}
                  onChange={(e) => handleUpdateUser(user.id, e.target.value)}
                  className="border p-1"
                >
                  <option value="USER">일반 사용자</option>
                  <option value="ADMIN">관리자</option>
                  <option value="SUPER_ADMIN">최고 관리자</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserManagement;
