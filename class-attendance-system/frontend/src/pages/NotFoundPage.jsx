import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage({ user }) {
  const homePath = user?.role === 'admin' ? '/admin/dashboard' : user ? '/my-attendance' : '/login';

  return (
    <div className="state-container" style={{ margin: '60px auto', maxWidth: '500px', padding: '48px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
      <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>404 - Page Not Found</h1>
      <p className="state-desc" style={{ marginBottom: '24px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to={homePath} className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
