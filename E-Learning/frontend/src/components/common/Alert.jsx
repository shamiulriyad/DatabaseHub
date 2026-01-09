import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="alert-close">&times;</button>
      )}
    </div>
  );
};

export default Alert;
