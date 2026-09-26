import { Bell } from 'lucide-react';

export const NotificationEmptyState = ({ compact = false }) => {
  return (
    <div
      style={{
        padding: compact ? '32px 16px' : '64px 20px',
        textAlign: 'center',
        color: '#64748b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: compact ? '44px' : '56px',
          height: compact ? '44px' : '56px',
          borderRadius: '50%',
          background: '#f1f5f9',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
        }}
      >
        <Bell size={compact ? 22 : 28} />
      </div>

      <h4
        style={{
          margin: '0 0 4px',
          fontSize: compact ? '14px' : '16px',
          fontWeight: 700,
          color: '#1e293b',
        }}
      >
        No notifications yet
      </h4>

      <p
        style={{
          margin: 0,
          fontSize: compact ? '12px' : '13.5px',
          color: '#64748b',
          maxWidth: compact ? '240px' : '320px',
          lineHeight: 1.4,
        }}
      >
        Your booking updates and important activity will appear here.
      </p>
    </div>
  );
};

export default NotificationEmptyState;
