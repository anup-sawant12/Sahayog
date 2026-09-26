import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationItem from './NotificationItem';
import NotificationEmptyState from './NotificationEmptyState';
import { CheckCheck, RefreshCw } from 'lucide-react';

export const NotificationDropdown = ({
  notifications = [],
  isLoading = false,
  error = null,
  unreadCount = 0,
  onMarkAllAsRead,
  onMarkAsRead,
  onClose,
  onRetry,
}) => {
  const { user } = useAuth();
  const isWorker = user?.role === 'WORKER';
  const fullPageUrl = isWorker ? '/worker/notifications' : '/customer/notifications';

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: '360px',
        maxWidth: '90vw',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
        overflow: 'hidden',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '520px',
      }}
    >
      {/* Dropdown Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          borderBottom: '1px solid #f1f5f9',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
            Notifications
          </h4>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: '#eff6ff',
                color: '#2563eb',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px 6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#2563eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1d4ed8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#2563eb')}
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List Body */}
      <div
        style={{
          overflowY: 'auto',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 0' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '56px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#b91c1c' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px' }}>Couldn&apos;t load notifications</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  color: '#b91c1c',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} /> Try again
              </button>
            )}
          </div>
        ) : notifications.length === 0 ? (
          <NotificationEmptyState compact={true} />
        ) : (
          notifications.slice(0, 6).map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkAsRead={onMarkAsRead}
              onCloseDropdown={onClose}
            />
          ))
        )}
      </div>

      {/* Dropdown Footer: View All Link */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          padding: '10px 16px',
          textAlign: 'center',
          background: '#f8fafc',
        }}
      >
        <Link
          to={fullPageUrl}
          onClick={onClose}
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#2563eb',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          View all notifications &rarr;
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
