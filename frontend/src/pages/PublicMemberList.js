import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

function PublicMemberList() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/members/public');
      setMembers(response.data);
      setError(null);
    } catch (error) {
      console.error('멤버 정보를 불러오는 중 오류 발생:', error);
      setError('멤버 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">교회 구성원</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {members.map(member => (
          <div key={member.id} className="text-center">
            <img 
              src={member.photoUrl || '/default-profile.png'} 
              alt={member.name} 
              className="w-32 h-32 object-cover rounded-full mx-auto mb-2"
            />
            <p>{member.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicMemberList;
