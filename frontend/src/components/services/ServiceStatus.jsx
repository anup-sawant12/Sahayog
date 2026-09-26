/**
 * ServiceStatus component
 * Renders an accessible, clear status badge for Active/Inactive service status.
 *
 * @param {Object} props
 * @param {string} props.status - "ACTIVE" or "INACTIVE"
 */
export const ServiceStatus = ({ status = 'ACTIVE' }) => {
  const isActive = status === 'ACTIVE';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        background: isActive ? '#ecfdf5' : '#f1f5f9',
        color: isActive ? '#065f46' : '#64748b',
        border: `1px solid ${isActive ? '#a7f3d0' : '#e2e8f0'}`,
        userSelect: 'none',
        letterSpacing: '0.01em',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: isActive ? '#10b981' : '#94a3b8',
        }}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

export default ServiceStatus;
