export const ErrorMessage = ({ message, errors = [], onDismiss }) => {
  if (!message && (!errors || errors.length === 0)) return null;

  return (
    <div
      className="error-banner"
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
        fontSize: '14px',
        lineHeight: 1.5,
        marginBottom: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#dc2626"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: '2px' }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div style={{ flex: 1 }}>
        {message && <div style={{ fontWeight: 600 }}>{message}</div>}
        {errors && errors.length > 0 && (
          <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '13px' }}>
            {errors.map((err, idx) => (
              <li key={idx}>
                {typeof err === 'string' ? err : err.message || JSON.stringify(err)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            padding: 0,
            fontSize: '16px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
