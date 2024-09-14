import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    birth_year: '',
    birth_month: '',
    birth_day: '',
    phone: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    district: '',
    spouse: '',
    position: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // 전화번호 자동 포맷팅
      const formatted = formatPhoneNumber(value);
      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API_URL을 사용하지 않고 상대 경로만 사용
      await axios.post('/api/members', formData);
      alert('회원이 성공적으로 등록되었습니다.');
      navigate('/');
    } catch (error) {
      alert('회원 등록에 실패했습니다. 다시 시도해 주세요.');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">신규 회원 등록</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block mb-1">이름:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="birth_year" className="block mb-1">생년:</label>
            <input
              type="number"
              id="birth_year"
              name="birth_year"
              value={formData.birth_year}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="birth_month" className="block mb-1">월:</label>
            <input
              type="number"
              id="birth_month"
              name="birth_month"
              value={formData.birth_month}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="birth_day" className="block mb-1">일:</label>
            <input
              type="number"
              id="birth_day"
              name="birth_day"
              value={formData.birth_day}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block mb-1">전화번호:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            placeholder="000-000-0000"
          />
        </div>
        <div>
          <label htmlFor="gender" className="block mb-1">성별:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">선택하세요</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="address" className="block mb-1">주소:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="city" className="block mb-1">도시:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="state" className="block mb-1">주/도:</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="zipcode" className="block mb-1">우편번호:</label>
          <input
            type="text"
            id="zipcode"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="district" className="block mb-1">지역구:</label>
          <input
            type="text"
            id="district"
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="spouse" className="block mb-1">배우자:</label>
          <input
            type="text"
            id="spouse"
            name="spouse"
            value={formData.spouse}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="position" className="block mb-1">직분:</label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
