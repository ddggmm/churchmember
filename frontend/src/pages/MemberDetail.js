import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function MemberDetail() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/members/${id}`);
      setMember(response.data);
    } catch (error) {
      console.error('Error fetching member:', error);
      setError('회원 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!member) return <div>회원을 찾을 �� 없습니다.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{member.name} 회원 정보</h2>
      <div className="space-y-2">
        <p><strong>성별:</strong> {member.gender}</p>
        <p><strong>생년월일:</strong> {member.birth_year}년 {member.birth_month}월 {member.birth_day}일</p>
        <p><strong>전화번호:</strong> {member.phone}</p>
        <p><strong>주소:</strong> {member.address}, {member.city}, {member.state} {member.zipcode}</p>
        <p><strong>지역구:</strong> {member.district}</p>
        <p><strong>배우자:</strong> {member.spouse}</p>
        <p><strong>직분:</strong> {member.position}</p>
      </div>
      {member.photo && (
        <div className="mt-4">
          <img src={`/uploads/${member.photo}`} alt={member.name} className="max-w-full h-auto" />
        </div>
      )}
      <div className="mt-4">
        <Link to={`/edit/${member.id}`} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">수정</Link>
        <Link to="/members" className="bg-gray-500 text-white px-4 py-2 rounded">목록으로</Link>
      </div>
    </div>
  );
}

export default MemberDetail;
