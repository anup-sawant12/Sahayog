export const CertificationStatus = ({ status }) => {
  const normalized = (status || 'PENDING').toUpperCase();

  const configs = {
    VERIFIED: {
      label: 'Verified',
      bg: '#ecfdf5',
      color: '#065f46',
      border: '#a7f3d0',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    PENDING: {
      label: 'Pending Verification',
      bg: '#fffbeb',
      color: '#92400e',
      border: '#fde68a',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    REJECTED: {
      label: 'Rejected',
      bg: '#fef2f2',
      color: '#991b1b',
      border: '#fecaca',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  };

  const current = configs[normalized] || configs.PENDING;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}
    >
      {current.icon}
      {current.label}
    </span>
  );
};

export default CertificationStatus;
