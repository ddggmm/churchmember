import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    // state를 사용하여 로그인 후 원래 가려던 페이지로 돌아갈 수 있게 함
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;