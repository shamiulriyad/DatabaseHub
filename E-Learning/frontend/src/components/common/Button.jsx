import React from 'react';
import PropTypes from 'prop-types';

/**
 * Modern, accessible Button component with multiple variants and sizes
 * 
 * Variants: primary, secondary, danger, success, outline, outline-secondary, ghost, link
 * Sizes: sm, md (default), lg
 * 
 * @param {React.ReactNode} children - Button content
 * @param {string} variant - Button style variant (default: 'primary')
 * @param {string} size - Button size (default: 'md')
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} disabled - Disable the button
 * @param {boolean} isLoading - Show loading state
 * @param {string} type - HTML button type (default: 'button')
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} leftIcon - Icon to display on left
 * @param {React.ReactNode} rightIcon - Icon to display on right
 * @param {string} ariaLabel - Accessibility label
 */
const Button = React.forwardRef(({ 
  children, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  leftIcon = null,
  rightIcon = null,
  ariaLabel = null,
  ...props 
}, ref) => {
  // Build class list
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    isLoading && 'btn-loading',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button 
      ref={ref}
      type={type}
      className={classNames}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      {...props}
    >
      {leftIcon && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'outline', 'outline-secondary', 'ghost', 'link']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  className: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  ariaLabel: PropTypes.string,
};

export default Button;
