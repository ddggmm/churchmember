import React, { useState, useRef, useCallback } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FaCamera } from 'react-icons/fa';

function MemberRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
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
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const navigate = useNavigate();

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') {
      value = formatPhoneNumber(value);
    }
    if (['address', 'city', 'zipcode'].includes(name)) {
      value = value.toUpperCase();
    }
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCameraCapture = () => {
    setIsCameraOpen(true);
  };

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const handleUsePhoto = () => {
    setPreviewUrl(capturedImage);
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setPhoto(file);
      });
    setIsCameraOpen(false);
    setCapturedImage(null);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
    setCapturedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataForServer = {
        name: formData.name,
        birthYear: formData.birthYear,
        birthMonth: formData.birthMonth,
        birthDay: formData.birthDay,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        district: formData.district,
        spouse: formData.spouse,
        position: formData.position
      };
      if (photo) {
        dataForServer.photo = await convertToBase64(photo);
      }
      const response = await axios.post('/api/members', dataForServer, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 201) {
        alert('성도가 성공적으로 등록되었습니다.');
        navigate('/');
      }
    } catch (error) {
      console.error('성도 등록 오류:', error);
      alert('성도 등록에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const videoConstraints = {
    width: 360,
    height: 480,
    facingMode: "user"
  };

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold mb-2 text-center text-blue-600">신규 등록</h2>
        <p className="text-center text-gray-600 mb-6">교인 정보를 등록해 주세요</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-1">
              이름 <span className="text-sm text-gray-400">(Name)</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="birthYear" className="block text-lg font-medium text-gray-700 mb-1">
              생년월일 <span className="text-sm text-gray-400">(Date of Birth)</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="birthYear"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                placeholder="년 (Year)"
                required
                className="w-1/3 px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleChange}
                placeholder="월 (Month)"
                required
                className="w-1/3 px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
                placeholder="일 (Day)"
                required
                className="w-1/3 px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-lg font-medium text-gray-700 mb-1">
              전화번호 <span className="text-sm text-gray-400">(Phone)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-lg font-medium text-gray-700 mb-1">
              성별 <span className="text-sm text-gray-400">(Gender)</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" className="text-right text-gray-400">선택하세요 (Select)</option>
              <option value="남자">남자</option>
              <option value="여자">여자</option>
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-lg font-medium text-gray-700 mb-1">
              주소 <span className="text-sm text-gray-400">(Address)</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-lg font-medium text-gray-700 mb-1">
              도시 <span className="text-sm text-gray-400">(City)</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-lg font-medium text-gray-700 mb-1">
              주 <span className="text-sm text-gray-400">(State)</span>
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" className="text-right text-gray-400">선택하세요 (Select)</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="zipcode" className="block text-lg font-medium text-gray-700 mb-1">
              우편번호 <span className="text-sm text-gray-400">(Zipcode)</span>
            </label>
            <input
              type="text"
              id="zipcode"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="district" className="block text-lg font-medium text-gray-700 mb-1">
              구역 <span className="text-sm text-gray-400">(District)</span>
            </label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="spouse" className="block text-lg font-medium text-gray-700 mb-1">
              배우자 <span className="text-sm text-gray-400">(Spouse)</span>
            </label>
            <input
              type="text"
              id="spouse"
              name="spouse"
              value={formData.spouse}
              onChange={handleChange}
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-lg font-medium text-gray-700 mb-1">
              직분 <span className="text-sm text-gray-400">(Position)</span>
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mt-6">
            <label className="block text-lg font-medium text-gray-700 mb-1">
              사진 <span className="text-sm text-gray-400">(Photo)</span>
            </label>
            <div className="mt-2 flex items-center space-x-4">
              <input type="file" accept="image/*" onChange={handlePhotoChange} ref={fileInputRef} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                파일선택
              </button>
              <button type="button" onClick={handleCameraCapture} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                <FaCamera size={20} />
              </button>
            </div>
            {isCameraOpen && (
              <div className="mt-4">
                <div className="relative" style={{width: '360px', height: '480px', overflow: 'hidden'}}>
                  {!capturedImage ? (
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />
                  ) : (
                    <img src={capturedImage} alt="Captured" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  )}
                </div>
                <div className="mt-2 flex justify-center space-x-4">
                  {!capturedImage ? (
                    <button type="button" onClick={handleCapture} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                      사진 찍기
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={handleUsePhoto} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                        사용하기
                      </button>
                      <button type="button" onClick={handleRetake} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
                        다시 찍기
                      </button>
                    </>
                  )}
                  <button type="button" onClick={handleCloseCamera} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    카메라 닫기
                  </button>
                </div>
              </div>
            )}
            {previewUrl && (
              <div className="mt-4">
                <img src={previewUrl} alt="Preview" style={{width: '360px', height: '480px', objectFit: 'cover'}} />
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <button type="submit" className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              등록 <span className="text-sm">(Register)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberRegistration;