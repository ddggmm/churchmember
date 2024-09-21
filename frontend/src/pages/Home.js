import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { FaSearch } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/members/public?name=${encodeURIComponent(searchTerm)}`);
        console.log('API 응답:', response.data);
        if (response.data.length === 1) {
          setSelectedMember(response.data[0]);
          setSearchResults([]);
        } else if (response.data.length > 1) {
          setSearchResults(response.data);
          setSelectedMember(null);
        } else {
          setSearchResults([]);
          setSelectedMember(null);
        }
      } catch (error) {
        console.error('검색 중 오류 발생:', error.response || error);
        setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [searchTerm]);

  const handleSelectMember = useCallback((member) => {
    setSelectedMember(member);
    setSearchResults([]);
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedMember(null);
    setError(null);
  }, []);

  const handleDetailView = useCallback(() => {
    if (selectedMember && isLoggedIn) {
      navigate(`/members/${selectedMember.id}`);
    }
  }, [selectedMember, isLoggedIn, navigate]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white pt-32">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="mb-16">
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative w-1/2 mx-auto">
              <div className="p-[2px] rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="조회할 이름을 입력해 주세요"
                  className="w-full h-12 sm:h-14 px-4 sm:px-6 pr-12 sm:pr-20 text-base sm:text-lg rounded-full focus:outline-none text-center"
                  disabled={isLoading}
                />
              </div>
              <button 
                type="submit" 
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
                aria-label="검색"
                disabled={isLoading}
              >
                <FaSearch size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </form>
        </div>
        {isLoading && <p className="text-center">검색 중...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">검색 결과</h3>
            <ul className="bg-white shadow-md rounded-lg overflow-hidden">
              {searchResults.map((member) => (
                <li 
                  key={member.id} 
                  onClick={() => handleSelectMember(member)}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                >
                  {member.name} {member.spouse && `(배우자: ${member.spouse})`}
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedMember && (
          <div className="mt-4 bg-white shadow-md rounded-lg overflow-hidden">
            <h3 className="text-xl font-semibold p-4 bg-gray-100">회원 정보</h3>
            <div className="p-4 flex items-center">
              {selectedMember.photoUrl && (
                <img src={selectedMember.photoUrl} alt={selectedMember.name} className="w-20 h-20 rounded-full mr-4" />
              )}
              <div>
                <p className="font-semibold">{selectedMember.name}</p>
                {selectedMember.spouse && <p>배우자: {selectedMember.spouse}</p>}
              </div>
            </div>
          </div>
        )}
        {(searchResults.length > 0 || selectedMember) && (
          <div className="mt-4 flex justify-end space-x-2">
            {isLoggedIn && selectedMember && (
              <button
                onClick={handleDetailView}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
              >
                상세보기
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
            >
              다시 검색
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
