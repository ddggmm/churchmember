import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { FaPrint, FaFileDownload, FaList } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MemberListPage.css';

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${process.env.REACT_APP_API_URL}${url}`;
};

function MemberListPage() {
  const location = useLocation();
  const searchResults = location.state?.searchResults;
  const [memberData, setMemberData] = useState({ members: [], currentPage: 1, totalPages: 1 });
  const [isSimpleView, setIsSimpleView] = useState(false);
  const [filters, setFilters] = useState({
    birthYear: '',
    birthMonth: '',
    city: '',
    district: '',
    position: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  console.log('로그인 상태:', isLoggedIn);  // 여기에 추가합니다.

  useEffect(() => {
    console.log('useEffect 실행');
    if (searchResults) {
      console.log('searchResults 사용');
      setMemberData({ members: searchResults, currentPage: 1, totalPages: 1 });
    } else {
      console.log('fetchMembers 호출');
      fetchMembers();
    }
  }, [searchResults]);

  useEffect(() => {
    console.log('Filters changed:', filters);
    // 필요한 경우 여기에 추가 로직을 넣을 수 있습니다.
  }, [filters]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      console.log('API 호출 시작');
      const response = await axios.get('/api/members');
      console.log('API 응답:', JSON.stringify(response.data, null, 2));
      console.log('첫 번째 회원 데이터:', JSON.stringify(response.data.members[0], null, 2));
      setMemberData({
        members: response.data.members.map(member => ({
          ...member,
          birthYear: member.birthYear,
          birthMonth: member.birthMonth,
          birthDay: member.birthDay
        })),
        currentPage: response.data.current_page,
        totalPages: response.data.pages
      });
      setError(null);
    } catch (error) {
      console.error('멤버 정보를 불러오는 중 오류 발생:', error);
      setError('멤버 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      console.log('API 호출 완료');
    }
  };

  const handlePrint = () => {
    // 인쇄 기능 구현 예정
    console.log('인쇄 기능이 호출되었습니다.');
  };

  const handleExport = () => {
    // 파일 저장 기능 구현 예정
    console.log('파일 저장 기능이 호출되었습니다.');
  };

  const filteredMembers = memberData.members.filter(member => {
    return (
      (!filters.birthYear || member.birthYear === parseInt(filters.birthYear)) &&
      (!filters.birthMonth || member.birthMonth === parseInt(filters.birthMonth)) &&
      (!filters.city || (member.city && member.city.toLowerCase().includes(filters.city.toLowerCase()))) &&
      (!filters.district || (member.district && member.district.toLowerCase().includes(filters.district.toLowerCase()))) &&
      (!filters.position || (member.position && member.position.toLowerCase().includes(filters.position.toLowerCase())))
    );
  });

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/default-profile.png'; // 기본 이미지 경로로 변경하세요
  };

  const resetFilters = () => {
    setFilters({
      birthYear: '',
      birthMonth: '',
      city: '',
      district: '',
      position: ''
    });
  };

  return (
    <div className="member-list-container">
      {isLoggedIn ? (
        <>
          <div className="member-list-header">
            <h2>성도 목록</h2>
            <div className="header-buttons">
              <button onClick={() => setIsSimpleView(!isSimpleView)}>
                <FaList /> {isSimpleView ? '상세보기' : '간략보기'}
              </button>
              <button onClick={handlePrint}>
                <FaPrint /> 인쇄하기
              </button>
              <button onClick={handleExport}>
                <FaFileDownload /> 파일저장
              </button>
              <button onClick={resetFilters}>필터 초기화</button>
            </div>
          </div>
          <div className="filter-container">
            <select
              value={filters.birthYear}
              onChange={(e) => setFilters({...filters, birthYear: e.target.value})}
            >
              <option value="">생년 선택</option>
              {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filters.birthMonth}
              onChange={(e) => setFilters({...filters, birthMonth: e.target.value})}
            >
              <option value="">생월 선택</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="도시"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
            />
            <input
              type="text"
              placeholder="구역"
              value={filters.district}
              onChange={(e) => setFilters({...filters, district: e.target.value})}
            />
            <input
              type="text"
              placeholder="직분"
              value={filters.position}
              onChange={(e) => setFilters({...filters, position: e.target.value})}
            />
          </div>
          <div className="member-list">
            {error && <p className="error-message">{error}</p>}
            {isLoading ? (
              <p>로딩 중...</p>
            ) : filteredMembers.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>등록일</th>
                    <th>이름</th>
                    <th>생년</th>
                    <th>생월</th>
                    <th>생일</th>
                    <th>전화번호</th>
                    <th>주소</th>
                    <th>도시</th>
                    <th>주</th>
                    <th>우편번호</th>
                    <th>구역</th>
                    <th>사진</th>
                    <th>성별</th>
                    <th>배우자</th>
                    <th>직분</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td>{member.id}</td>
                      <td>{member.register_date}</td>
                      <td>{member.name}</td>
                      <td>{member.birthYear || ''}</td>
                      <td>{member.birthMonth || ''}</td>
                      <td>{member.birthDay || ''}</td>
                      <td>{member.phone}</td>
                      <td>{member.address}</td>
                      <td>{member.city}</td>
                      <td>{member.state}</td>
                      <td>{member.zipcode}</td>
                      <td>{member.district}</td>
                      <td>
                        {member.photoUrl ? (
                          <div className="photo-container">
                            <img 
                              src={getFullImageUrl(member.photoUrl)} 
                              alt={`${member.name}의 사진`} 
                              className="member-photo-thumbnail" 
                              onError={handleImageError}
                            />
                            <img 
                              src={getFullImageUrl(member.photoUrl)} 
                              alt={`${member.name}의 사진`} 
                              className="member-photo-full" 
                            />
                          </div>
                        ) : (
                          <span>사진 없음</span>
                        )}
                      </td>
                      <td>{member.gender}</td>
                      <td>{member.spouse}</td>
                      <td>{member.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>표시할 회원이 없습니다.</p>
            )}
          </div>
        </>
      ) : (
        <p>이 페이지를 보려면 로그인이 필요합니다.</p>
      )}
    </div>
  );
}

export default MemberListPage;
