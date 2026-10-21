import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to={user?.role === 'admin' ? '/admin/dashboard' : user ? '/my-attendance' : '/login'} className="navbar-brand">
          <span className="navbar-logo-icon">📋</span>
          <span>AttendanceSystem</span>
        </NavLink>

        <ul className="navbar-links">
          {/* Admin Navigation Links */}
          {user && user.role === 'admin' && (
            <>
              <li>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/subjects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Subjects
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/attendance/mark" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Mark Attendance
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/shortage" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Shortage Report
                </NavLink>
              </li>
            </>
          )}

          {/* Student Navigation Links */}
          {user && user.role === 'student' && (
            <li>
              <NavLink to="/my-attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                My Attendance
              </NavLink>
            </li>
          )}

          {/* Guest / Public Links */}
          {!user && (
            <>
              <li>
                <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Register
                </NavLink>
              </li>
            </>
          )}

          {/* Logged in User Profile & Logout */}
          {user && (
            <>
              <li className="user-badge">
                <span>{user.name}</span>
                <span className={`role-pill ${user.role}`}>
                  {user.role}
                </span>
              </li>
              <li>
                <button onClick={handleLogoutClick} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
