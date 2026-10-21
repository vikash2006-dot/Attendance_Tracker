import React from 'react';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="state-container">
      <div className="spinner"></div>
      <p className="state-desc">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
