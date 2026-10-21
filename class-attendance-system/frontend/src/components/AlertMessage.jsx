import React from 'react';

function AlertMessage({ type = 'error', message, onClose }) {
  if (!message) return null;

  const alertClass =
    type === 'success'
      ? 'alert-success'
      : type === 'info'
      ? 'alert-info'
      : 'alert-error';

  return (
    <div className={`alert ${alertClass}`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
          aria-label="Close message"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default AlertMessage;
