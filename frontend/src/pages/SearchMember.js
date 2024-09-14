import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchMember() {
  const [searchName, setSearchName] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSearchResult(null);

    try {
      const response = await fetch(`/api/members/search?name=${searchName}`);
      const data = await response.json();

      if (response.ok) {
        if (data.length > 0) {
          setSearchResult(data);
        } else {
          setError('일치하는 이름이 없습니다. 신규 등록 하시겠습니까?');
        }
      } else {
        setError('검색 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  const handleNewRegistration = () => {
    navigate('/search');
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="이름을 입력하세요"
        />
        <button type="submit">검색</button>
      </form>

      {searchResult && (
        <div>
          <h2>검색 결과:</h2>
          {searchResult.map((member) => (
            <div key={member.id}>
              <p>이름: {member.name}</p>
              <p>전화번호: {member.phone}</p>
              {/* 필요한 다른 정보들을 여기에 추가 */}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div>
          <p>{error}</p>
          {error.includes('신규 등록') && (
            <div>
              <button onClick={handleNewRegistration}>신규 등록</button>
              <button onClick={() => setError('')}>다시 검색</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchMember;
