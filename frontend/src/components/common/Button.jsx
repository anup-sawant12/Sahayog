import Loader from './Loader';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'medium', // 'small' | 'medium' | 'large'
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  icon = null,
  style = {},
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    fontWeight: 600,
    borderRadius: '10px',
    border: '1px solid transparent',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    width: fullWidth ? '100%' : 'auto',
    outline: 'none',
    userSelect: 'none',
    boxSizing: 'border-box',
    textDecoration: 'none',
  };

  const sizeStyles = {
    small: {
      padding: '8px 14px',
      fontSize: '13px',
      height: '36px',
    },
    medium: {
      padding: '11px 20px',
      fontSize: '15px',
      height: '46px',
    },
    large: {
      padding: '14px 24px',
      fontSize: '16px',
      height: '52px',
    },
  };

  const variantStyles = {
    primary: {
      background: disabled || isLoading ? '#94a3b8' : '#1e40af', // Deep professional blue
      color: '#ffffff',
      boxShadow: disabled || isLoading ? 'none' : '0 2px 4px rgba(30, 64, 175, 0.2), 0 1px 2px rgba(30, 64, 175, 0.1)',
      border: '1px solid transparent',
    },
    secondary: {
      background: '#f1f5f9',
      color: '#1e293b',
      border: '1px solid #e2e8f0',
    },
    outline: {
      background: 'transparent',
      color: '#1e40af',
      border: '1px solid #cbd5e1',
    },
    ghost: {
      background: 'transparent',
      color: '#475569',
      border: '1px solid transparent',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...(sizeStyles[size] || sizeStyles.medium),
    ...(variantStyles[variant] || variantStyles.primary),
    opacity: disabled ? 0.65 : 1,
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={combinedStyles}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader size="small" color="currentColor" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
