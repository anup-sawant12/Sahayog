export const BookingStatusBadge = ({ status, size = 'medium' }) => {
  const isSmall = size === 'small';

  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending',
          color: '#d97706',
          bg: '#fffbeb',
          border: '#fde68a',
          dot: '#f59e0b',
        };
      case 'CONFIRMED':
        return {
          label: 'Confirmed',
          color: '#2563eb',
          bg: '#eff6ff',
          border: '#bfdbfe',
          dot: '#3b82f6',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          color: '#dc2626',
          bg: '#fef2f2',
          border: '#fecaca',
          dot: '#ef4444',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: '#64748b',
          bg: '#f8fafc',
          border: '#e2e8f0',
          dot: '#94a3b8',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: '#059669',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          dot: '#10b981',
        };
      default:
        return {
          label: status || 'Unknown',
          color: '#475569',
          bg: '#f1f5f9',
          border: '#cbd5e1',
          dot: '#64748b',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '3px 8px' : '4px 12px',
        borderRadius: '9999px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: isSmall ? '12px' : '13px',
        fontWeight: 600,
        lineHeight: 1.2,
      }}
    >
      <span
        style={{
          width: isSmall ? '6px' : '7px',
          height: isSmall ? '6px' : '7px',
          borderRadius: '50%',
          background: config.dot,
        }}
      />
      {config.label}
    </span>
  );
};

export default BookingStatusBadge;
