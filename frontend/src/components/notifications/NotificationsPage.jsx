import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import notificationApi from '../../services/notification.api';
import NotificationItem from './NotificationItem';
import NotificationEmptyState from './NotificationEmptyState';
import Button from '../common/Button';
import { ArrowLeft, CheckCheck, RefreshCw, Bell } from 'lucide-react';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isWorker = user?.role === 'WORKER';

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await notificationApi.getNotifications({ take: 50 });
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch {
      // Keep state if failed
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await notificationApi.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Keep state if failed
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 24px', textAlign: 'left' }}>
      {/* Back button */}
      <button
        type="button"
        onClick={() => {
          if (user?.role === 'ADMIN') navigate('/admin/dashboard');
          else if (isWorker) navigate('/worker/dashboard');
          else navigate('/customer/dashboard');
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: '18px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Header card */}
      <div
        style={{
          background: user?.role === 'ADMIN'
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : isWorker
            ? 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)'
            : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          borderRadius: '20px',
          padding: '30px 32px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} color="#ffffff" />
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  background: '#ffffff',
                  color: isWorker ? '#0f766e' : '#1e40af',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '14.5px', color: isWorker ? '#ccfbf1' : '#dbeafe' }}>
            Stay updated with your bookings and service activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="small"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            style={{
              background: '#ffffff',
              color: isWorker ? '#0f766e' : '#1e40af',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCheck size={16} />
            {isMarkingAll ? 'Marking...' : 'Mark all as read'}
          </Button>
        )}
      </div>

      {/* Main List */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '72px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#991b1b' }}>
            <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 700 }}>
              Couldn&apos;t load notifications
            </p>
            <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: '#b91c1c' }}>{error}</p>
            <Button
              variant="outline"
              size="small"
              onClick={fetchNotifications}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Try Again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <NotificationEmptyState compact={false} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
