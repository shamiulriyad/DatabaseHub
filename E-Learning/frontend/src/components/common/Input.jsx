import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  error,
  ...props 
}) => {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <input type={type} {...props} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;
