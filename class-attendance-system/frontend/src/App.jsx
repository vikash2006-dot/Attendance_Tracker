import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Navigation
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SubjectListPage from './pages/SubjectListPage';
import SubjectFormPage from './pages/SubjectFormPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import MarkAttendancePage from './pages/MarkAttendancePage';
import ShortageReportPage from './pages/ShortageReportPage';
import MyAttendancePage from './pages/MyAttendancePage';
import MySubjectDetailPage from './pages/MySubjectDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  // Store logged-in user in state, initialized from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('attendance_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Handle successful login or registration
  const handleLogin = (userData, token) => {
    localStorage.setItem('attendance_token', token);
    localStorage.setItem('attendance_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('attendance_token');
    localStorage.removeItem('attendance_user');
    setUser(null);
  };

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="main-content">
        <Routes>
          {/* Default Route: Redirect based on role or to login */}
          <Route
            path="/"
            element={
              user ? (
                user.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/my-attendance" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/my-attendance'} replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/my-attendance'} replace />
              ) : (
                <RegisterPage onLogin={handleLogin} />
              )
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute user={user} allowedRole="admin">
                <AdminDashboardPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <ProtectedRoute user={user} allowedRole="admin">
                <SubjectListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects/new"
            element={
              <ProtectedRoute user={user} allowedRole="admin">
                <SubjectFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects/:id/edit"
            element={
              <ProtectedRoute user={user} allowedRole="admin">
                <SubjectFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects/:id"
            element={
              <ProtectedRoute user={user} allowedRole="admin">
                <SubjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance/mark"
            element={
              <ProtectedRoute user={user} allowedRole="admin">
                <MarkAttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shortage"
            element={
              <ProtectedRoute user={user} allowedRole="admin">
                <ShortageReportPage />
              </ProtectedRoute>
            }
          />

          {/* Student Protected Routes */}
          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute user={user} allowedRole="student">
                <MyAttendancePage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-attendance/:subjectId"
            element={
              <ProtectedRoute user={user} allowedRole="student">
                <MySubjectDetailPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All Page */}
          <Route path="*" element={<NotFoundPage user={user} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
