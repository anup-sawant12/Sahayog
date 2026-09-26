import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import notificationApi from '../../services/notification.api';
import NotificationDropdown from './NotificationDropdown';

export const NotificationBell = ({ buttonStyle = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  // 1. Fetch unread count on mount
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadNotificationCount();
      if (res.success && res.data) {
        setUnreadCount(Number(res.data.unreadCount) || 0);
      }
    } catch {
      // Non-blocking: fail gracefully without crashing
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // 2. Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await notificationApi.getNotifications({ take: 8 });
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  // 3. Mark single notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markNotificationAsRead(notificationId);

      // Optimistically update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Keep state if API failed
    }
  };

  // 4. Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Keep state if API failed
    }
  };

  // 5. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#ffffff',
          position: 'relative',
          transition: 'all 0.15s ease',
          ...buttonStyle,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = buttonStyle.background || 'rgba(255, 255, 255, 0.15)';
        }}
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              minWidth: '19px',
              height: '19px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              border: '2px solid #ffffff',
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          error={error}
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
          onMarkAsRead={handleMarkAsRead}
          onClose={() => setIsOpen(false)}
          onRetry={fetchNotifications}
        />
      )}
    </div>
  );
};

export default NotificationBell;
