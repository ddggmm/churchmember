import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Home from './pages/Home';
import MemberRegistration from './pages/MemberRegistration';
import MemberListPage from './pages/MemberListPage';
import MemberEdit from './pages/MemberEdit';
import MemberDetail from './pages/MemberDetail';
import AdminUserManagement from './pages/AdminUserManagement';
import PublicMemberList from './pages/PublicMemberList';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/members" element={<PrivateRoute><MemberListPage /></PrivateRoute>} />
        <Route path="/members/:id" element={<PrivateRoute><MemberDetail /></PrivateRoute>} />
        <Route path="/member-registration" element={<PrivateRoute><MemberRegistration /></PrivateRoute>} />
        <Route path="/edit" element={<PrivateRoute><MemberEdit /></PrivateRoute>} />
        <Route path="/members/search" element={<PrivateRoute><MemberListPage /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute><AdminUserManagement /></PrivateRoute>} />
      </Routes>
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