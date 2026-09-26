import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, HardHat, FileText, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AdminRequiresAttention = ({
  pendingWorkers = 0,
  openServiceRequests = 0,
  pendingBookings = 0,
}) => {
  const navigate = useNavigate();

  const totalAttentionItems = pendingWorkers + openServiceRequests + pendingBookings;

  if (totalAttentionItems === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={22} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
            All Caught Up!
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            There are no pending worker approvals, open requests, or pending bookings that require immediate attention.
          </p>
        </div>
      </div>
    );
  }

  const items = [
    {
      id: 'workers',
      count: pendingWorkers,
      label: `${pendingWorkers} worker${pendingWorkers !== 1 ? 's' : ''} waiting for profile approval`,
      icon: HardHat,
      color: '#d97706',
      bg: '#fef3c7',
      link: '/admin/workers?status=PENDING',
      btnLabel: 'Review',
    },
    {
      id: 'requests',
      count: openServiceRequests,
      label: `${openServiceRequests} open service request${openServiceRequests !== 1 ? 's' : ''} awaiting fulfillment`,
      icon: FileText,
      color: '#2563eb',
      bg: '#eff6ff',
      link: '/admin/service-requests?status=OPEN',
      btnLabel: 'View',
    },
    {
      id: 'bookings',
      count: pendingBookings,
      label: `${pendingBookings} pending booking${pendingBookings !== 1 ? 's' : ''} in queue`,
      icon: Calendar,
      color: '#7c3aed',
      bg: '#f3e8ff',
      link: '/admin/bookings?status=PENDING',
      btnLabel: 'View',
    },
  ].filter((item) => item.count > 0);

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)',
        borderRadius: '16px',
        border: '1px solid #fef3c7',
        boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.05)',
        padding: '22px 24px',
        marginBottom: '28px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #fef3c7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#92400e' }}>
              Requires Attention
            </h3>
            <span style={{ fontSize: '12px', color: '#b45309' }}>
              {totalAttentionItems} item{totalAttentionItems !== 1 ? 's' : ''} require administrative oversight
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#ffffff',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                  {item.label}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate(item.link)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
              >
                <span>{item.btnLabel}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminRequiresAttention;
