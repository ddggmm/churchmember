import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { FaEdit, FaSave, FaCamera, FaTrash } from 'react-icons/fa';
import styles from './AdminMemberManagement.module.css'

const getFullImageUrl = (url) => {
  if (!url) return '/default-profile.png';
  if (url.startsWith('http')) return url;
  return `${process.env.REACT_APP_API_URL}${url}`;
};

function AdminMemberManagement() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/members');
      setMembers(response.data.members);
      setError(null);
    } catch (error) {
      console.error('회원 목록 불러오기 실패:', error);
      setError('회원 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleEdit = (member) => {
    setEditingMember({ ...member });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/members/${editingMember.id}`, editingMember);
      setEditingMember(null);
      fetchMembers();
    } catch (error) {
      console.error('회원 정보 수정 실패:', error);
      if (error.response) {
        setError(`회원 정보 수정 실패: ${error.response.data.message || error.response.data.error}`);
      } else if (error.request) {
        setError('서버 응답이 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        setError('요청 설정 중 오류가 발생했습니다.');
      }
    }
  };

  const handleChange = (e, field) => {
    setEditingMember({ ...editingMember, [field]: e.target.value });
  };

  const handlePhotoChange = async (e, memberId) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('photo', file);

      try {
        await axios.put(`/api/members/${memberId}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        fetchMembers();
      } catch (error) {
        console.error('사진 업로드 실패:', error);
        setError('사진 업로드에 실패했습니다.');
      }
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('정말로 이 회원을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/members/${memberId}`);
        fetchMembers();
      } catch (error) {
        console.error('회원 삭제 실패:', error);
        setError('회원 삭제에 실패했습니다.');
      }
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/" />;
  }

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">회원 관리</h2>
      <table className={styles.memberList}>
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">사진</th>
            <th className="border border-gray-300 p-2">이름</th>
            <th className="border border-gray-300 p-2">생년</th>
            <th className="border border-gray-300 p-2">생월</th>
            <th className="border border-gray-300 p-2">생일</th>
            <th className="border border-gray-300 p-2">전화번호</th>
            <th className="border border-gray-300 p-2">주소</th>
            <th className="border border-gray-300 p-2">도시</th>
            <th className="border border-gray-300 p-2">주</th>
            <th className="border border-gray-300 p-2">우편번호</th>
            <th className="border border-gray-300 p-2">구역</th>
            <th className="border border-gray-300 p-2">성별</th>
            <th className="border border-gray-300 p-2">배우자</th>
            <th className="border border-gray-300 p-2">직분</th>
            <th className="border border-gray-300 p-2">작업</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td className={styles.photoContainer}>
                <img 
                  src={getFullImageUrl(member.photoUrl)} 
                  alt={member.name} 
                  className={styles.memberPhoto}
                />
                <label htmlFor={`photo-upload-${member.id}`} className={styles.photoUploadLabel}>
                  <FaCamera />
                  <input
                    id={`photo-upload-${member.id}`}
                    type="file"
                    onChange={(e) => handlePhotoChange(e, member.id)}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </td>
              {['name', 'birthYear', 'birthMonth', 'birthDay', 'phone', 'address', 'city', 'state', 'zipcode', 'district', 'gender', 'spouse', 'position'].map((field) => (
                <td key={field} className="border border-gray-300 p-2">
                  {editingMember && editingMember.id === member.id ? (
                    <input
                      type="text"
                      value={editingMember[field] || ''}
                      onChange={(e) => handleChange(e, field)}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    member[field]
                  )}
                </td>
              ))}
              <td className={styles.actionCell}>
                {editingMember && editingMember.id === member.id ? (
                  <button
                    onClick={handleSave}
                    className={`${styles.actionButton} ${styles.saveButton}`}
                    title="저장"
                  >
                    <FaSave />
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(member)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                    title="수정"
                  >
                    <FaEdit />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(member.id)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  title="삭제"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminMemberManagement;
