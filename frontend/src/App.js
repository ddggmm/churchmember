import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';  // Home 컴포넌트 import
import MemberRegistration from './pages/MemberRegistration';
import MemberListPage from './pages/MemberListPage';
import MemberEdit from './pages/MemberEdit';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {isLoggedIn && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                {/* 홈 페이지를 기본 경로로 설정 */}
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/members"
            element={
              <PrivateRoute>
                <MemberListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/member-registration"
            element={
              <PrivateRoute>
                <MemberRegistration />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit"
            element={
              <PrivateRoute>
                <MemberEdit />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;