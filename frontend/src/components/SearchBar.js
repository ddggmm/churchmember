import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
    setError('');
    setSearchResults([]);

    try {
      const response = await axios.get(`/api/members/search?name=${encodeURIComponent(searchTerm)}`);
      console.log('Search results:', response.data);
      
      if (Array.isArray(response.data)) {
        setSearchResults(response.data);
        if (response.data.length === 0) {
          setError('일치하는 이름이 없습니다. 신규 등록 하시겠습니까?');
        }
      } else {
        setError('서버로부터 예상치 못한 응답을 받았습니다.');
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error during search:', error);
      setError('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  const handleNewRegistration = () => {
    navigate('/register');
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md px-4">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          예수소망교회 교인 검색
        </h1>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex items-center w-full shadow-md hover:shadow-lg focus-within:shadow-lg bg-white border border-gray-200 rounded-full overflow-hidden">
            <input
              className="appearance-none bg-transparent border-none w-full text-gray-700 py-2 px-4 leading-tight focus:outline-none"
              type="text"
              placeholder="이름을 입��하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="flex-shrink-0 bg-transparent text-gray-500 hover:text-gray-700 py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
              type="submit"
            >
              <FaSearch size={20} />
            </button>
          </div>
        </form>

        {error && (
          <div className="text-center mb-4">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            {error.includes('신규 등록') && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleNewRegistration}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  예
                </button>
                <button
                  onClick={handleResetSearch}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  다시 검색
                </button>
              </div>
            )}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">검색 결과:</h2>
            {searchResults.map((member) => (
              <div key={member.id} className="mb-4 p-4 border-b">
                <p className="text-gray-700">이름: {member.name}</p>
                <p className="text-gray-700">전화번호: {member.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;