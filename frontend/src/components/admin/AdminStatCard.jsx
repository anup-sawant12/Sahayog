import React from 'react';

export const AdminStatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  badge,
  badgeType = 'neutral', // 'warning', 'success', 'primary', 'neutral'
  onClick,
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'warning':
        return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
      case 'success':
        return { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'primary':
        return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
      default:
        return { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '22px 24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
        {Icon && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {value ?? 0}
        </span>
        {badge && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              ...getBadgeStyle(),
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
};

export default AdminStatCard;
