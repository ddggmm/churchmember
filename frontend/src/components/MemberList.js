import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';

function MemberList() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/members');
      setMembers(response.data.members);
      setError(null);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('회원 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>회원 목록</h2>
      {members.length > 0 ? (
        <ul>
          {members.map(member => (
            <li key={member.id}>
              <Link to={`/member/${member.id}`}>
                {member.name} {member.spouse && `(배우자: ${member.spouse})`}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>표시할 회원이 없습니다.</p>
      )}
      <Link to="/new">새 회원 등록</Link>
    </div>
  );
}

export default MemberList;
