import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { FaPrint, FaFileDownload, FaList, FaFilter } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MemberListPage.css';
import * as XLSX from 'xlsx';

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${process.env.REACT_APP_API_URL}${url}`;
};

function MemberListPage() {
  const location = useLocation();
  const searchResults = location.state?.searchResults;
  const [memberData, setMemberData] = useState({ members: [], currentPage: 1, totalPages: 1 });
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
  const [isSimpleView, setIsSimpleView] = useState(false);

  console.log('로그인 상태:', isLoggedIn);

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
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .member-list-container, .member-list-container * {
          visibility: visible;
        }
        .member-list-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .member-list-header, .filter-container {
          display: none !important;
        }
        .photo-hover {
          display: none !important;
        }
        @page {
          size: ${isSimpleView ? 'letter portrait' : 'letter landscape'};
          margin: 0.5in;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: ${isSimpleView ? '10pt' : '8pt'};
        }
        th, td {
          border: 1px solid #ddd;
          padding: 4px;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        th {
          background-color: #f2f2f2;
        }
        .member-photo-thumbnail {
          width: ${isSimpleView ? '60px' : '40px'};
          height: ${isSimpleView ? '84px' : '56px'};
          object-fit: cover;
        }
        /* 열 너비 조정 */
        ${isSimpleView ? `
          th:nth-child(1), td:nth-child(1) { width: 5%; }   /* ID */
          th:nth-child(2), td:nth-child(2) { width: 12%; }  /* 사진 */
          th:nth-child(3), td:nth-child(3) { width: 15%; }  /* 이름 */
          th:nth-child(4), td:nth-child(4) { width: 18%; }  /* 생년월일 */
          th:nth-child(5), td:nth-child(5) { width: 30%; }  /* 전화번호 */
          th:nth-child(6), td:nth-child(6) { width: 20%; }  /* 구역 */
        ` : `
          th:nth-child(1), td:nth-child(1) { width: 3%; }   /* ID */
          th:nth-child(2), td:nth-child(2) { width: 5%; }   /* 사진 */
          th:nth-child(3), td:nth-child(3) { width: 8%; }   /* 이름 */
          th:nth-child(4), td:nth-child(4),
          th:nth-child(5), td:nth-child(5),
          th:nth-child(6), td:nth-child(6) { width: 5%; }   /* 생년월일 */
          th:nth-child(7), td:nth-child(7) { width: 12%; }  /* 전화번호 */
          th:nth-child(8), td:nth-child(8) { width: 20%; }  /* 주소 */
          th:nth-child(9), td:nth-child(9) { width: 10%; }  /* 도시 */
          th:nth-child(10), td:nth-child(10) { width: 3%; } /* 주 */
          th:nth-child(11), td:nth-child(11) { width: 6%; } /* 우편번호 */
          th:nth-child(12), td:nth-child(12) { width: 5%; } /* 구역 */
          th:nth-child(13), td:nth-child(13) { width: 4%; } /* 성별 */
          th:nth-child(14), td:nth-child(14) { width: 8%; } /* 배우자 */
          th:nth-child(15), td:nth-child(15) { width: 6%; } /* 직분 */
        `}
      }
    `;

    // 스타일을 head에 추가
    document.head.appendChild(style);

    // 인쇄 대화상자 열기
    window.print();

    // 인쇄 대화상자가 닫힌 후 스타일 제거 (약간의 지연 후)
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const handleExport = () => {
    const dataToExport = filteredMembers.map(member => ({
      ID: member.id,
      이름: member.name,
      생년: member.birthYear,
      생월: member.birthMonth,
      생일: member.birthDay,
      전화번호: member.phone,
      주소: member.address,
      도시: member.city,
      주: member.state,
      우편번호: member.zipcode,
      구역: member.district,
      성별: member.gender,
      배우자: member.spouse,
      직분: member.position
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, "회원목록");
    XLSX.writeFile(wb, "회원목록.xlsx");
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

  const resetFilters = () => {
    setFilters({
      birthYear: '',
      birthMonth: '',
      city: '',
      district: '',
      position: ''
    });
  };

  const toggleView = () => {
    setIsSimpleView(!isSimpleView);
  };

  const handleFilterChange = (filter, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filter]: value }));
  };

  const handleFilterApply = () => {
    // 필터 적용 로직
  };

  return (
    <div className="member-list-container">
      {isLoggedIn ? (
        <>
          <div className="member-list-header">
            <h2>성도 목록</h2>
            <div className="member-list-controls">
              <div className="view-controls">
                <button onClick={toggleView} className="btn btn-primary">
                  <FaList /> {isSimpleView ? '상세보기' : '간략보기'}
                </button>
                <button onClick={handlePrint} className="btn btn-secondary">
                  <FaPrint /> 인쇄하기
                </button>
                <button onClick={handleExport} className="btn btn-secondary">
                  <FaFileDownload /> 파일저장
                </button>
              </div>
              
              <div className="filter-controls">
                <select 
                  value={filters.birthYear} 
                  onChange={(e) => handleFilterChange('birthYear', e.target.value)}
                  className="form-select"
                >
                  <option value="">생년 선택</option>
                  {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <select 
                  value={filters.birthMonth} 
                  onChange={(e) => handleFilterChange('birthMonth', e.target.value)}
                  className="form-select"
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
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="form-input"
                />
                
                <input 
                  type="text" 
                  placeholder="구역" 
                  value={filters.district} 
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  className="form-input"
                />
                
                <input 
                  type="text" 
                  placeholder="직분" 
                  value={filters.position} 
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                  className="form-input"
                />
                
                <button onClick={handleFilterApply} className="btn btn-primary">
                  <FaFilter /> 필터 적용
                </button>
              </div>
            </div>
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
                    <th>사진</th>
                    <th>이름</th>
                    {isSimpleView ? (
                      <>
                        <th>생년월일</th>
                        <th>전화번호</th>
                        <th>구역</th>
                      </>
                    ) : (
                      <>
                        <th>생년</th>
                        <th>생월</th>
                        <th>생일</th>
                        <th>전화번호</th>
                        <th>주소</th>
                        <th>도시</th>
                        <th>주</th>
                        <th>우편번호</th>
                        <th>구역</th>
                        <th>성별</th>
                        <th>배우자</th>
                        <th>직분</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td>{member.id}</td>
                      <td className="photo-cell">
                        {member.photoUrl && (
                          <div className="photo-container">
                            <img 
                              src={getFullImageUrl(member.photoUrl)} 
                              alt={member.name} 
                              className="member-photo-thumbnail"
                            />
                            <div className="photo-hover">
                              <img 
                                src={getFullImageUrl(member.photoUrl)} 
                                alt={member.name} 
                                className="member-photo-large"
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td>{member.name}</td>
                      {isSimpleView ? (
                        <>
                          <td>{`${member.birthYear}-${member.birthMonth}-${member.birthDay}`}</td>
                          <td>{member.phone}</td>
                          <td>{member.district}</td>
                        </>
                      ) : (
                        <>
                          <td>{member.birthYear}</td>
                          <td>{member.birthMonth}</td>
                          <td>{member.birthDay}</td>
                          <td>{member.phone}</td>
                          <td>{member.address}</td>
                          <td>{member.city}</td>
                          <td>{member.state}</td>
                          <td>{member.zipcode}</td>
                          <td>{member.district}</td>
                          <td>{member.gender}</td>
                          <td>{member.spouse}</td>
                          <td>{member.position}</td>
                        </>
                      )}
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
