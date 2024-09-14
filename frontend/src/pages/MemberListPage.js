import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axiosConfig';
import { useLocation } from 'react-router-dom';
import { FaPrint } from 'react-icons/fa';  // FaPrint를 추가로 import
import './MemberListPage.css';  // CSS 파일 import

function MemberListPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const location = useLocation();

  const fetchSearchResults = useCallback(async (term) => {
    try {
      const response = await axios.get(`/api/members/search?name=${term}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setSearchResults([]);
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      fetchSearchResults(searchTerm);
    }
  }, [location.search, fetchSearchResults]);

  const handleViewDetails = async (memberId) => {
    try {
      const response = await axios.get(`/api/members/${memberId}`);
      setSelectedMember(response.data);
    } catch (error) {
      console.error('회원 정보를 불러오는 중 오류 발생:', error);
      alert('회원 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="member-list-container">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">검색 결과</h2>
      <div className="flex">
        <div className="w-1/3 pr-4">
          {searchResults.length > 0 ? (
            <ul className="member-list">
              {searchResults.map((member) => (
                <li key={member.id} className="member-list-item">
                  <button onClick={() => handleViewDetails(member.id)}>
                    {member.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-600">검색 결과가 없습니다.</p>
          )}
        </div>
        <div className="w-2/3 pl-4">
          {selectedMember && (
            <div className="member-details">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">{selectedMember.name} 등록카드</h3>
                {selectedMember.photoUrl && (
                  <img 
                    src={selectedMember.photoUrl} 
                    alt={`${selectedMember.name}의 사진`} 
                    className="member-photo"
                  />
                )}
              </div>
              <p><strong>생년월일:</strong> 
                {selectedMember.birthYear}/
                {String(selectedMember.birthMonth).padStart(2, '0')}/
                {String(selectedMember.birthDay).padStart(2, '0')}
              </p>
              <p><strong>전화번호:</strong> {selectedMember.phone}</p>
              <p><strong>주소:</strong> {selectedMember.address}</p>
              <p><strong>도시:</strong> {selectedMember.city}</p>
              <p><strong>주/도:</strong> {selectedMember.state}</p>
              <p><strong>우편번호:</strong> {selectedMember.zipcode}</p>
              <p><strong>구역:</strong> {selectedMember.district}</p>
              <p><strong>배우자:</strong> {selectedMember.spouse}</p>
              <p><strong>직분:</strong> {selectedMember.position}</p>
              <button 
                onClick={handlePrint}
                className="print-button mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-150 ease-in-out"
              >
                <FaPrint className="inline-block mr-2" />
                등록카드 인쇄
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberListPage;
