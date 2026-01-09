import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}) => {
  return (
    <button 
      type={type} 
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
