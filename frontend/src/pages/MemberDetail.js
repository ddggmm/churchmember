import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import './MemberDetail.css';

function MemberDetail() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(`/api/members/${id}`);
        console.log('API response:', response.data);
        setMember(response.data);
        setLoading(false);
      } catch (err) {
        console.error('API error:', err);
        setError('회원 정보를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">에러: {error}</div>;
  if (!member) return <div className="not-found">회원을 찾을 수 없습니다.</div>;

  // 수정: 모든 사용자가 인쇄할 수 있도록 변경
  const canPrint = true;
  
  // 수정: ADMIN, SUPER_ADMIN, ELDER만 수정 가능
  const canEdit = user && ['ADMIN', 'SUPER_ADMIN', 'ELDER'].includes(user.role);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    console.log('Edit member:', member.id);
    // 여기에 수정 페이지로 이동하는 로직을 추가할 수 있습니다.
  };

  return (
    <div className="member-detail">
      <div className="member-header">
        <img
          src={member.photoUrl || '/default-profile.png'}
          alt={`${member.name}의 프로필 사진`}
          className="member-photo"
        />
        <h2 className="member-name">{member.name}</h2>
      </div>
      <table className="member-info">
        <tbody>
          <tr>
            <th>등록일</th>
            <td>{member.register_date}</td>
          </tr>
          <tr>
            <th>생년월일</th>
            <td>{`${member.birthYear}-${member.birthMonth}-${member.birthDay}`}</td>
          </tr>
          <tr>
            <th>성별</th>
            <td>{member.gender}</td>
          </tr>
          <tr>
            <th>전화번호</th>
            <td>{member.phone}</td>
          </tr>
          <tr>
            <th>주소</th>
            <td>{`${member.address}, ${member.city}, ${member.state} ${member.zipcode}`}</td>
          </tr>
          <tr>
            <th>구역</th>
            <td>{member.district}</td>
          </tr>
          <tr>
            <th>배우자</th>
            <td>{member.spouse || '없음'}</td>
          </tr>
          <tr>
            <th>직분</th>
            <td>{member.position}</td>
          </tr>
        </tbody>
      </table>
      <div className="button-container">
        {canPrint && (
          <button onClick={handlePrint} className="print-button">
            인쇄하기
          </button>
        )}
        {canEdit && (
          <button onClick={handleEdit} className="edit-button">
            수정하기
          </button>
        )}
      </div>
    </div>
  );
}

export default MemberDetail;
