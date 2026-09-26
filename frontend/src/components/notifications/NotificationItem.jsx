import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  CalendarPlus,
  CheckCircle2,
  CircleX,
  CalendarX,
  CheckCheck,
  Bell,
} from 'lucide-react';

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = Math.max(0, now - past);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'NEW_BOOKING':
      return {
        icon: CalendarPlus,
        color: '#2563eb',
        bg: '#eff6ff',
      };
    case 'BOOKING_CONFIRMED':
      return {
        icon: CheckCircle2,
        color: '#059669',
        bg: '#ecfdf5',
      };
    case 'BOOKING_REJECTED':
      return {
        icon: CircleX,
        color: '#dc2626',
        bg: '#fef2f2',
      };
    case 'BOOKING_CANCELLED':
      return {
        icon: CalendarX,
        color: '#e11d48',
        bg: '#fff1f2',
      };
    case 'BOOKING_COMPLETED':
      return {
        icon: CheckCheck,
        color: '#0d9488',
        bg: '#f0fdfa',
      };
    default:
      return {
        icon: Bell,
        color: '#64748b',
        bg: '#f1f5f9',
      };
  }
};

export const NotificationItem = ({ notification, onMarkAsRead, onCloseDropdown }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!notification) return null;

  const { icon: IconComponent, color, bg } = getNotificationIcon(notification.type);
  const isUnread = !notification.isRead;

  const handleClick = async () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    if (onCloseDropdown) {
      onCloseDropdown();
    }

    if (notification.relatedBookingId) {
      const isWorker = user?.role === 'WORKER';
      const targetRoute = isWorker
        ? `/worker/bookings/${notification.relatedBookingId}`
        : `/customer/bookings/${notification.relatedBookingId}`;
      navigate(targetRoute);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '10px',
        background: isUnread ? '#f0fdf4' : '#ffffff',
        border: isUnread ? '1px solid #bbf7d0' : '1px solid #f1f5f9',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isUnread ? '#dcfce7' : '#f8fafc';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isUnread ? '#f0fdf4' : '#ffffff';
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        <IconComponent size={18} color={color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
          <h5
            style={{
              margin: '0 0 3px',
              fontSize: '13.5px',
              fontWeight: isUnread ? 700 : 600,
              color: isUnread ? '#0f172a' : '#334155',
              lineHeight: 1.3,
            }}
          >
            {notification.title}
          </h5>
          <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '12.5px',
            color: isUnread ? '#334155' : '#64748b',
            lineHeight: 1.4,
            overflowWrap: 'break-word',
          }}
        >
          {notification.message}
        </p>
      </div>

      {/* Unread dot indicator */}
      {isUnread && (
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#16a34a',
            flexShrink: 0,
            marginTop: '6px',
          }}
          title="Unread"
        />
      )}
    </div>
  );
};

export default NotificationItem;
