import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MemberList() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/members');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  return (
    <div>
      <h2>회원 목록</h2>
      <ul>
        {members.map(member => (
          <li key={member.id}>
            <Link to={`/member/${member.id}`}>{member.name}</Link>
          </li>
        ))}
      </ul>
      <Link to="/new">새 회원 등록</Link>
    </div>
  );
}

export default MemberList;
