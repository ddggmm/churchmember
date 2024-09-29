import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axiosConfig';
import { FaPrint, FaFileDownload, FaList, FaFilter, FaEraser, FaEdit, FaSave, FaFileImport } from 'react-icons/fa';
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
  const { isLoggedIn, user } = useAuth();
  const [isSimpleView, setIsSimpleView] = useState(false);
  const [uniqueValues, setUniqueValues] = useState({
    cities: [],
    districts: [],
    positions: []
  });
  const [editingMember, setEditingMember] = useState(null);
  const isAdmin = user && (user.role === 'admin' || user.role === 'SUPER_ADMIN');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (searchResults) {
      setMemberData({ members: searchResults, currentPage: 1, totalPages: 1 });
    } else {
      fetchMembers();
    }
  }, [searchResults]);

  useEffect(() => {
    console.log('Filters changed:', filters);
  }, [filters]);

  useEffect(() => {
    if (memberData.members.length > 0) {
      const cities = [...new Set(memberData.members.map(member => member.city))];
      const districts = [...new Set(memberData.members.map(member => member.district))];
      const positions = [...new Set(memberData.members.map(member => member.position))];
      
      setUniqueValues({
        cities: cities.filter(Boolean),
        districts: districts.filter(Boolean),
        positions: positions.filter(Boolean)
      });
    }
  }, [memberData.members]);

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
    let dataToExport;
    if (isSimpleView) {
      dataToExport = filteredMembers.map(member => ({
        ID: member.id,
        이름: member.name,
        생년월일: `${member.birthYear}-${member.birthMonth}-${member.birthDay}`,
        전화번호: member.phone,
        구역: member.district
      }));
    } else {
      dataToExport = filteredMembers.map(member => ({
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
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, "회원목록");
    
    // 열 너비 자동 조정
    const colWidths = dataToExport.reduce((widths, row) => {
      Object.keys(row).forEach((key, index) => {
        const value = row[key] ? row[key].toString() : '';
        widths[index] = Math.max(widths[index] || 0, value.length);
      });
      return widths;
    }, {});
    
    ws['!cols'] = Object.keys(colWidths).map(key => ({ wch: colWidths[key] }));

    XLSX.writeFile(wb, `회원목록_${isSimpleView ? '간략' : '상'}.xlsx`);
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
    // 모든 회원 데이터를 다시 불러오는 함수 호출
    fetchMembers();
  };

  const toggleView = () => {
    setIsSimpleView(!isSimpleView);
  };

  const handleFilterChange = (filter, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [filter]: value };
      applyFilters(newFilters);
      return newFilters;
    });
  };

  const applyFilters = (currentFilters) => {
    const filteredMembers = memberData.members.filter(member => {
      return (
        (!currentFilters.birthYear || member.birthYear === parseInt(currentFilters.birthYear)) &&
        (!currentFilters.birthMonth || member.birthMonth === parseInt(currentFilters.birthMonth)) &&
        (!currentFilters.city || (member.city && member.city.toLowerCase().includes(currentFilters.city.toLowerCase()))) &&
        (!currentFilters.district || (member.district && member.district.toLowerCase().includes(currentFilters.district.toLowerCase()))) &&
        (!currentFilters.position || (member.position && member.position.toLowerCase().includes(currentFilters.position.toLowerCase())))
      );
    });
    setMemberData(prevData => ({ ...prevData, members: filteredMembers }));
  };

  const tableRef = useRef(null);

  useEffect(() => {
    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [memberData.members]); // memberData.members가 변경될 때마다 실행

  const adjustFontSize = () => {
    const table = tableRef.current;
    if (!table) return;

    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
      let fontSize = 14; // 초기 폰트 크기
      cell.style.fontSize = `${fontSize}px`;

      while (cell.scrollWidth > cell.offsetWidth && fontSize > 8) {
        fontSize--;
        cell.style.fontSize = `${fontSize}px`;
      }
    });
  };

  const handleMouseEnter = (event) => {
    const hoverElement = event.currentTarget.querySelector('.photo-hover');
    const rect = event.currentTarget.getBoundingClientRect();
    hoverElement.style.top = `${rect.top - 220}px`;
    hoverElement.style.left = `${rect.right + 10}px`;
  };

  const handleEdit = (member) => {
    setEditingMember(member);
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/members/${editingMember.id}`, editingMember);
      setMemberData(prevData => ({
        ...prevData,
        members: prevData.members.map(m => 
          m.id === editingMember.id ? editingMember : m
        )
      }));
      setEditingMember(null);
    } catch (error) {
      console.error('멤버 정보 수정 중 오류 발생:', error);
      setError('멤버 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e, field) => {
    setEditingMember(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleImportDB = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        setIsLoading(true);
        const response = await axios.post('/api/import-db', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('파일 업로드 성공:', response.data);
        // 성공 메시지 표시 또는 다른 작업 수행
        fetchMembers(); // 회원 목록 새로고침
      } catch (error) {
        console.error('파일 업로드 실패:', error);
        setError('데이터베이스 가져오기 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="member-list-container">
      {isLoggedIn ? (
        <>
          <div className="member-list-header">
            <h2>성도 목록</h2>
            <div className="member-list-controls">
              <div className="view-controls">
                <button 
                  onClick={toggleView} 
                  className={`btn btn-toggle ${isSimpleView ? 'detailed' : ''}`}
                >
                  <FaList /> {isSimpleView ? '상세보기' : '간략보기'}
                </button>
                <button onClick={handlePrint} className="btn btn-secondary">
                  <FaPrint /> 인쇄하기
                </button>
                <button onClick={handleExport} className="btn btn-secondary">
                  <FaFileDownload /> 파일저장
                </button>
                {user && user.role === 'SUPER_ADMIN' && (
                  <>
                    <button onClick={handleImportDB} className="btn btn-primary">
                      <FaFileImport /> Import DB
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                      accept=".csv"
                    />
                  </>
                )}
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
                
                <select 
                  value={filters.city} 
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="form-select"
                >
                  <option value="">도시 선택</option>
                  {uniqueValues.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                
                <select 
                  value={filters.district} 
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  className="form-select"
                >
                  <option value="">구역 선택</option>
                  {uniqueValues.districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                
                <select 
                  value={filters.position} 
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                  className="form-select"
                >
                  <option value="">직분 선택</option>
                  {uniqueValues.positions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
                
                <button onClick={resetFilters} className="btn btn-secondary">
                  <FaEraser /> 필터값 지우기
                </button>
              </div>
            </div>
          </div>
          <div className="member-list">
            {error && <p className="error-message">{error}</p>}
            {isLoading ? (
              <p>로딩 중...</p>
            ) : filteredMembers.length > 0 ? (
              <table ref={tableRef} className={`member-list ${isSimpleView ? 'simple' : 'detailed'}`}>
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
                    {isAdmin && <th>작업</th>} {/* 관리자용 열 추가 */}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td>{member.id}</td>
                      <td>
                        <div className="photo-container" onMouseEnter={handleMouseEnter}>
                          <img 
                            src={getFullImageUrl(member.photoUrl) || '/default-profile.png'} 
                            alt={member.name} 
                            className="member-photo-thumbnail"
                          />
                          <div className="photo-hover">
                            <img 
                              src={getFullImageUrl(member.photoUrl) || '/default-profile.png'} 
                              alt={member.name} 
                              className="member-photo-large"
                            />
                          </div>
                        </div>
                      </td>
                      {isSimpleView ? (
                        <>
                          <td>{member.name}</td>
                          <td>{`${member.birthYear}-${member.birthMonth}-${member.birthDay}`}</td>
                          <td>{member.phone}</td>
                          <td>{member.district}</td>
                        </>
                      ) : (
                        <>
                          {['name', 'birthYear', 'birthMonth', 'birthDay', 'phone', 'address', 'city', 'state', 'zipcode', 'district', 'gender', 'spouse', 'position'].map(field => (
                            <td key={field}>
                              {editingMember && editingMember.id === member.id ? (
                                <input
                                  value={editingMember[field]}
                                  onChange={(e) => handleChange(e, field)}
                                />
                              ) : (
                                member[field]
                              )}
                            </td>
                          ))}
                        </>
                      )}
                      {isAdmin && (
                        <td>
                          {editingMember && editingMember.id === member.id ? (
                            <button onClick={handleSave} className="edit-button"><FaSave /></button>
                          ) : (
                            <button onClick={() => handleEdit(member)} className="edit-button"><FaEdit /></button>
                          )}
                        </td>
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