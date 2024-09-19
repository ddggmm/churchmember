import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import './MemberDetail.css';

function MemberDetail() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(`/api/members/${id}`);
        console.log('API response:', response.data); // 응답 확인용
        setMember(response.data);
        setLoading(false);
      } catch (err) {
        console.error('API error:', err); // 에러 로깅
        setError('회원 정보를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!member) return <div>회원을 찾을 수 없습니다.</div>;

  console.log('Member data:', member); // 데이터 확인용

  return (
    <div className="member-detail">
      <div className="flex flex-col items-start mb-4">
        <div className="w-48 h-48 flex items-center justify-center overflow-hidden rounded-lg mb-2 bg-gray-100">
          <img
            src={member.photoUrl || '/default-profile.png'}
            alt={`${member.name}의 프로필 사진`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold">{member.name}</h2>
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
    </div>
  );
}

export default MemberDetail;
