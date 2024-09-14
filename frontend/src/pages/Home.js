import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/members?search=${encodeURIComponent(searchTerm)}`);
    }
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
    </div>
  );
}

export default Home;
