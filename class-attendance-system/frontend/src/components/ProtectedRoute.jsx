import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Component to protect routes based on authentication status and user role
 */
function ProtectedRoute({ user, allowedRole, children }) {
  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is specified and does not match user's role
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/my-attendance" replace />;
  }

  return children;
}

export default ProtectedRoute;
