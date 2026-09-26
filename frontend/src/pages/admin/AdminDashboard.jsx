import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminRequiresAttention from '../../components/admin/AdminRequiresAttention';
import adminApi from '../../services/admin.api';
import Loader from '../../components/common/Loader';
import {
  Users,
  HardHat,
  UserCheck,
  CheckCircle,
  Calendar,
  Clock,
  CheckCheck,
  FileText,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <AdminLayout
      title="Platform Operations Dashboard"
      subtitle="Real-time monitoring and administrative oversight"
    >
      {/* Header bar controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            System Overview
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Live platform metrics and pending operational actions
          </span>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.background = '#ffffff';
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color="#dc2626" />
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#991b1b' }}>
                Something went wrong
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c' }}>{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchDashboardData}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !stats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: '130px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ height: '14px', width: '60%', background: '#f1f5f9', borderRadius: '4px' }} />
                <div style={{ height: '32px', width: '40%', background: '#e2e8f0', borderRadius: '6px' }} />
                <div style={{ height: '12px', width: '80%', background: '#f8fafc', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
          <div style={{ height: '100px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }} />
        </div>
      ) : stats ? (
        <>
          {/* Key Statistics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            <AdminStatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              subtext="Platform accounts registered"
              onClick={() => navigate('/admin/users')}
            />

            <AdminStatCard
              icon={HardHat}
              label="Total Workers"
              value={stats.totalWorkers}
              subtext={`${stats.pendingWorkers || 0} waiting approval`}
              badge={stats.pendingWorkers > 0 ? `${stats.pendingWorkers} Pending` : undefined}
              badgeType="warning"
              onClick={() => navigate('/admin/workers')}
            />

            <AdminStatCard
              icon={AlertCircle}
              label="Pending Approvals"
              value={stats.pendingWorkers}
              subtext="Requires verification review"
              badge={stats.pendingWorkers > 0 ? 'Action Required' : 'Cleared'}
              badgeType={stats.pendingWorkers > 0 ? 'warning' : 'success'}
              onClick={() => navigate('/admin/workers?status=PENDING')}
            />

            <AdminStatCard
              icon={UserCheck}
              label="Active Workers"
              value={stats.activeWorkers}
              subtext="Eligible for customer matching"
              badge="Ready"
              badgeType="success"
              onClick={() => navigate('/admin/workers?status=APPROVED')}
            />

            <AdminStatCard
              icon={Calendar}
              label="Total Bookings"
              value={stats.totalBookings}
              subtext="Lifetime service bookings"
              onClick={() => navigate('/admin/bookings')}
            />

            <AdminStatCard
              icon={Clock}
              label="Pending Bookings"
              value={stats.pendingBookings}
              subtext="Awaiting worker acceptance"
              badgeType="neutral"
              onClick={() => navigate('/admin/bookings?status=PENDING')}
            />

            <AdminStatCard
              icon={CheckCheck}
              label="Completed Bookings"
              value={stats.completedBookings}
              subtext="Successfully delivered tasks"
              badgeType="success"
              onClick={() => navigate('/admin/bookings?status=COMPLETED')}
            />

            <AdminStatCard
              icon={FileText}
              label="Open Service Requests"
              value={stats.openServiceRequests}
              subtext="Customer requests seeking match"
              badge={stats.openServiceRequests > 0 ? `${stats.openServiceRequests} Active` : undefined}
              badgeType="primary"
              onClick={() => navigate('/admin/service-requests?status=OPEN')}
            />
          </div>

          {/* Requires Attention Banner */}
          <AdminRequiresAttention
            pendingWorkers={stats.pendingWorkers}
            openServiceRequests={stats.openServiceRequests}
            pendingBookings={stats.pendingBookings}
          />

          {/* Quick Monitoring Grid: Pending Workers & Recent Bookings */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Pending Workers For Review */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Workers Awaiting Approval
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Profiles requiring administrative verification
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/admin/workers?status=PENDING')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>View All</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {stats.recentPendingWorkers && stats.recentPendingWorkers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.recentPendingWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '14px',
                          }}
                        >
                          {worker.user?.name ? worker.user.name.charAt(0).toUpperCase() : 'W'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                            {worker.user?.name || 'Worker'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {worker.experienceYears ?? 0} yrs exp • {worker.user?.phone || 'No phone'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/admin/workers/${worker.id}`)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          background: '#2563eb',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                  <CheckCircle size={32} color="#16a34a" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    All caught up!
                  </p>
                  <span style={{ fontSize: '13px' }}>There are no workers waiting for approval.</span>
                </div>
              )}
            </div>

            {/* Recent Bookings Activity */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Recent Bookings
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Latest marketplace booking transactions
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/admin/bookings')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>View All</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.recentBookings.map((b) => {
                    const statusColorMap = {
                      PENDING: { bg: '#fef3c7', text: '#b45309' },
                      CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
                      COMPLETED: { bg: '#dcfce7', text: '#15803d' },
                      CANCELLED: { bg: '#fee2e2', text: '#b91c1c' },
                      REJECTED: { bg: '#f1f5f9', text: '#475569' },
                    };
                    const color = statusColorMap[b.status] || { bg: '#f1f5f9', text: '#475569' };

                    return (
                      <div
                        key={b.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: '#f8fafc',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                              {b.workerService?.serviceName || 'Custom Service'}
                            </span>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: color.bg,
                                color: color.text,
                              }}
                            >
                              {b.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {b.customer?.name} → {b.worker?.user?.name || 'Assigned Worker'} • ₹{b.price}
                          </div>
                        </div>

                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                  <Calendar size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    No bookings found
                  </p>
                  <span style={{ fontSize: '13px' }}>Bookings will appear here as customers place requests.</span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </AdminLayout>
  );
};

export default AdminDashboard;
