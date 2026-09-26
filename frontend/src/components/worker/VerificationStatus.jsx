export const VerificationStatus = ({ status = 'PENDING', showCard = false }) => {
  const config = {
    APPROVED: {
      label: 'Verified Worker',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      textColor: '#166534',
      dotColor: '#22c55e',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      description: 'Your worker profile has been approved and verified by cooperative administration.',
    },
    REJECTED: {
      label: 'Verification Rejected',
      badgeBg: '#fef2f2',
      badgeBorder: '#fecaca',
      textColor: '#991b1b',
      dotColor: '#ef4444',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      description: 'Your verification request could not be approved. Please review your details or contact your cooperative administrator.',
    },
    PENDING: {
      label: 'Verification Pending',
      badgeBg: '#fffbeb',
      badgeBorder: '#fef3c7',
      textColor: '#b45309',
      dotColor: '#f59e0b',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      description: 'Your profile is currently awaiting verification by the cooperative federation. Bookings will activate once approved.',
    },
  };

  const current = config[status] || config.PENDING;

  if (!showCard) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700,
          background: current.badgeBg,
          color: current.textColor,
          border: `1px solid ${current.badgeBorder}`,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: current.dotColor,
          }}
        ></span>
        {current.label}
      </span>
    );
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px 28px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Verification Status
        </h3>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            background: current.badgeBg,
            color: current.textColor,
            border: `1px solid ${current.badgeBorder}`,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: current.dotColor,
            }}
          ></span>
          {current.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: current.badgeBg, border: `1px solid ${current.badgeBorder}`, borderRadius: '10px', padding: '14px 16px' }}>
        <div style={{ flexShrink: 0, marginTop: '2px' }}>{current.icon}</div>
        <p style={{ margin: 0, fontSize: '13px', color: current.textColor, lineHeight: 1.5 }}>
          {current.description}
        </p>
      </div>
    </div>
  );
};

export default VerificationStatus;
