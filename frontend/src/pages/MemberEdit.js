import React, { useState, useRef } from 'react';
import axios from '../utils/axiosConfig';
import Webcam from 'react-webcam';
import { FaCamera } from 'react-icons/fa';

function MemberEdit() {
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const videoConstraints = {
    width: 360,
    height: 480,
    facingMode: "user"
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/api/members/search?name=${searchName}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      alert('검색 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleSelectMember = async (member) => {
    try {
      const response = await axios.get(`/api/members/${member.id}`);
      const memberData = response.data;
      
      console.log('서버��서 받아온 회원 데이터:', memberData);
      
      // 생년월일 처리
      const birth_year = memberData.birthYear ? memberData.birthYear.toString() : '';
      const birth_month = memberData.birthMonth ? String(memberData.birthMonth).padStart(2, '0') : '';
      const birth_day = memberData.birthDay ? String(memberData.birthDay).padStart(2, '0') : '';
      
      setSelectedMember({
        ...memberData,
        birth_year,
        birth_month,
        birth_day,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('회원 정보 불러오기 중 오류 발생:', error);
      alert('회원 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedMember({ ...selectedMember, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedMember = { ...selectedMember };
      if (updatedMember.birth_year && updatedMember.birth_month && updatedMember.birth_day) {
        updatedMember.birth_date = `${updatedMember.birth_year}-${updatedMember.birth_month}-${updatedMember.birth_day}`;
      }
      if (updatedMember.photo && updatedMember.photo.startsWith('data:image')) {
        updatedMember.photo = updatedMember.photo.split(',')[1];
      }
      await axios.put(`/api/members/${selectedMember.id}`, updatedMember, {
        headers: { 'Content-Type': 'application/json' }
      });
      alert('수정이 완료되었습니다.');
      setSelectedMember(null);
      setSearchName('');
      setSearchResults([]);
      setIsEditing(false);
    } catch (error) {
      console.error('수정 중 오류 발생:', error);
      alert('회원 정보 수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelectedMember({ ...selectedMember, photo: imageSrc });
    setIsCameraOpen(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedMember({ ...selectedMember, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-3xl font-bold mb-2 text-center text-blue-600">등록 수정</h2>
      <p className="text-center text-gray-600 mb-6">수정할 성도님의 정보를 입력해 주세요</p>
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="수정할 성도님 이름을 입력해 주세요"
          className="border p-2 mr-2 w-full max-w-md"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded">검색</button>
      </div>
      {searchResults.length > 0 && (
        <ul className="mb-4">
          {searchResults.map((member) => (
            <li key={member.id} onClick={() => handleSelectMember(member)} className="cursor-pointer hover:bg-gray-100 p-2">
              {member.name} {member.spouse && `(배우자: ${member.spouse})`}
            </li>
          ))}
        </ul>
      )}
      {selectedMember && (
        <div className="border p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">{selectedMember.name} 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedMember.photo && (
              <img src={selectedMember.photo} alt="Member" className="w-full h-auto rounded-lg" style={{maxWidth: '360px', maxHeight: '480px', objectFit: 'cover'}} />
            )}
            <div>
              <p><strong>이름:</strong> {selectedMember.name}</p>
              <p><strong>생년월일:</strong> {selectedMember.birth_year && selectedMember.birth_month && selectedMember.birth_day ? 
                `${selectedMember.birth_year}-${selectedMember.birth_month}-${selectedMember.birth_day}` : 
                '정보 없음'}
              </p>
              <p><strong>전화번호:</strong> {selectedMember.phone}</p>
              <p><strong>주소:</strong> {selectedMember.address}</p>
              <p><strong>도시:</strong> {selectedMember.city}</p>
              <p><strong>주/도:</strong> {selectedMember.state}</p>
              <p><strong>우편번호:</strong> {selectedMember.zipcode}</p>
              <p><strong>구역:</strong> {selectedMember.district}</p>
              <p><strong>배우자:</strong> {selectedMember.spouse}</p>
              <p><strong>직분:</strong> {selectedMember.position}</p>
            </div>
          </div>
          {!isEditing ? (
            <button onClick={handleEdit} className="bg-yellow-500 text-white p-2 rounded mt-4">수정하기</button>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" value={selectedMember.name} onChange={handleChange} placeholder="이름" className="border p-2" />
                <input type="text" name="birth_year" value={selectedMember.birth_year} onChange={handleChange} placeholder="생년" className="border p-2" />
                <input type="text" name="birth_month" value={selectedMember.birth_month} onChange={handleChange} placeholder="생월" className="border p-2" />
                <input type="text" name="birth_day" value={selectedMember.birth_day} onChange={handleChange} placeholder="생일" className="border p-2" />
                <input type="text" name="phone" value={selectedMember.phone} onChange={handleChange} placeholder="전화번호" className="border p-2" />
                <input type="text" name="address" value={selectedMember.address} onChange={handleChange} placeholder="주소" className="border p-2" />
                <input type="text" name="city" value={selectedMember.city} onChange={handleChange} placeholder="도시" className="border p-2" />
                <input type="text" name="state" value={selectedMember.state} onChange={handleChange} placeholder="주/도" className="border p-2" />
                <input type="text" name="zipcode" value={selectedMember.zipcode} onChange={handleChange} placeholder="우편번호" className="border p-2" />
                <input type="text" name="district" value={selectedMember.district} onChange={handleChange} placeholder="구역" className="border p-2" />
                <input type="text" name="spouse" value={selectedMember.spouse} onChange={handleChange} placeholder="배우자" className="border p-2" />
                <input type="text" name="position" value={selectedMember.position} onChange={handleChange} placeholder="직분" className="border p-2" />
              </div>
              <div className="mt-4">
                <h4 className="font-bold mb-2">사진 수정</h4>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setIsCameraOpen(true)} className="bg-green-500 text-white p-2 rounded">
                    <FaCamera className="inline-block mr-2" />
                    카메라로 찍기
                  </button>
                  <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current.click()} className="bg-blue-500 text-white p-2 rounded">파일 업로드</button>
                </div>
                {isCameraOpen && (
                  <div className="mt-2">
                    <div className="relative" style={{width: '360px', height: '480px', overflow: 'hidden'}}>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                      />
                    </div>
                    <button onClick={handleCapture} className="bg-red-500 text-white p-2 rounded mt-2">사진 찍기</button>
                  </div>
                )}
                {selectedMember.photo && (
                  <div className="mt-2">
                    <img src={selectedMember.photo} alt="Preview" style={{width: '360px', height: '480px', objectFit: 'cover'}} />
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white p-2 rounded">취소</button>
                <button type="submit" className="bg-green-500 text-white p-2 rounded">수정완료</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default MemberEdit;
