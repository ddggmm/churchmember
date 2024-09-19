import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import axios from '../utils/axiosConfig';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const response = await axios.get(`/api/members/search?name=${encodeURIComponent(searchTerm)}`);
        if (response.data.length === 1) {
          navigate(`/members/${response.data[0].id}`);
        } else if (response.data.length > 1) {
          setSearchResults(response.data);
        } else {
          alert('검색 결과가 없습니다. 다시 확인해 주세요.');
          setSearchResults([]);
        }
      } catch (error) {
        console.error('검색 중 오류 발생:', error);
        alert('검색 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSelectMember = (id) => {
    navigate(`/members/${id}`);
    setSearchResults([]);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-3xl font-bold mb-2 text-center text-blue-600">성도 목록</h2>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <div className="p-[2px] rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <input
              className="w-full h-12 sm:h-14 px-4 sm:px-6 pr-12 sm:pr-20 text-base sm:text-lg rounded-full focus:outline-none text-center"
              type="text"
              placeholder="조회할 이름을 입력해 주세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
            type="submit"
          >
            <FaSearch size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </form>
      {searchResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">검색 결과</h3>
          <ul className="bg-white shadow-md rounded-lg overflow-hidden">
            {searchResults.map((member) => (
              <li 
                key={member.id} 
                onClick={() => handleSelectMember(member.id)}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                {member.name} {member.spouse && `(배우자: ${member.spouse})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Home;
