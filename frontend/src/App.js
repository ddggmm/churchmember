import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Home from './pages/Home';
import MemberRegistration from './pages/MemberRegistration';
import MemberListPage from './pages/MemberListPage';
import MemberEdit from './pages/MemberEdit';
import MemberDetail from './pages/MemberDetail';

function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="App">
      {isLoggedIn && <Header />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="/members" element={isLoggedIn ? <MemberListPage /> : <Login />} />
        <Route path="/members/:id" element={isLoggedIn ? <MemberDetail /> : <Login />} />
        <Route path="/member-registration" element={isLoggedIn ? <MemberRegistration /> : <Login />} />
        <Route path="/edit" element={isLoggedIn ? <MemberEdit /> : <Login />} />
        <Route path="/members/search" element={isLoggedIn ? <MemberListPage /> : <Login />} />
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