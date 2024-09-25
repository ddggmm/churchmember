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
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';  // 404 페이지 컴포넌트 (새로 만들어야 함)
import AdminDashboard from './pages/AdminDashboard';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') 
    ? children 
    : <Navigate to="/" />;
}

function Layout({ children }) {
  return (
    <div className="App">
      <Header />
      {children}
    </div>
  );
}

function AppContent() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/members" element={<PrivateRoute><MemberListPage /></PrivateRoute>} />
        <Route path="/members/:id" element={<PrivateRoute><MemberDetail /></PrivateRoute>} />
        <Route path="/member-registration" element={<PrivateRoute><MemberRegistration /></PrivateRoute>} />
        <Route path="/edit" element={<PrivateRoute><MemberEdit /></PrivateRoute>} />
        <Route path="/members/search" element={<PrivateRoute><MemberListPage /></PrivateRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUserManagement /></AdminRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
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