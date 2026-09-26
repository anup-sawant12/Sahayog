import { useState, forwardRef } from 'react';

export const Input = forwardRef(({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = null,
  helperText = null,
  icon = null,
  required = false,
  disabled = false,
  className = '',
  autoComplete,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`input-field-group ${className}`} style={{ marginBottom: '18px', textAlign: 'left' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1e293b',
            marginBottom: '6px',
            letterSpacing: '0.01em',
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px',
          border: error ? '1.5px solid #ef4444' : isFocused ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
          background: disabled ? '#f8fafc' : '#ffffff',
          boxShadow: isFocused
            ? error
              ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
              : '0 0 0 3px rgba(37, 99, 235, 0.15)'
            : '0 1px 2px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.15s ease-in-out',
        }}
      >
        {icon && (
          <div
            style={{
              paddingLeft: '14px',
              display: 'flex',
              alignItems: 'center',
              color: error ? '#ef4444' : isFocused ? '#2563eb' : '#94a3b8',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          style={{
            width: '100%',
            height: '46px',
            padding: icon ? '0 14px 0 10px' : isPassword ? '0 40px 0 14px' : '0 14px',
            fontSize: '15px',
            fontFamily: 'inherit',
            color: '#0f172a',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              color: '#64748b',
              transition: 'color 0.15s ease',
            }}
          >
            {showPassword ? (
              // Eye off icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error ? (
        <div
          id={`${inputId}-error`}
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: '#dc2626',
            fontSize: '12px',
            marginTop: '5px',
            fontWeight: 500,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <div id={`${inputId}-helper`} style={{ color: '#64748b', fontSize: '12px', marginTop: '5px' }}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
