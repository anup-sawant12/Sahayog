import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import adminApi from '../../services/admin.api';
import {
  Search,
  Filter,
  HardHat,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export const AdminWorkers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = searchParams.get('status') || 'ALL';
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [workers, setWorkers] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await adminApi.getWorkers(params);
      if (res.success && Array.isArray(res.data)) {
        setWorkers(res.data);
        setTotal(res.total || res.data.length);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workers list.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    if (status === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
          >
            <CheckCircle size={12} />
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            }}
          >
            <XCircle size={12} />
            REJECTED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              background: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fde68a',
            }}
          >
            <Clock size={12} />
            PENDING
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="Worker Management"
      subtitle="Review registrations, verify credentials, and manage marketplace labor pool"
    >
      {/* Top action / filter bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '420px' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by worker name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              outline: 'none',
              background: '#f8fafc',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusFilterChange(status)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                border: statusFilter === status ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: statusFilter === status ? '#eff6ff' : '#ffffff',
                color: statusFilter === status ? '#1d4ed8' : '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              {status === 'ALL' ? 'All Workers' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}

          <button
            type="button"
            onClick={fetchWorkers}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12.5px',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#dc2626" />
            <span style={{ fontSize: '13.5px', color: '#991b1b', fontWeight: 500 }}>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchWorkers}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Workers Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Worker
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Contact
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Services / Skills
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Experience
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Registered
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td colSpan={7} style={{ padding: '18px 20px' }}>
                      <div style={{ height: '24px', background: '#f8fafc', borderRadius: '6px' }} />
                    </td>
                  </tr>
                ))
              ) : workers.length > 0 ? (
                workers.map((w) => {
                  const isPending = w.verificationStatus === 'PENDING';

                  return (
                    <tr
                      key={w.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Worker info */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#1d4ed8',
                              fontWeight: 700,
                              fontSize: '13px',
                              flexShrink: 0,
                            }}
                          >
                            {w.user?.name ? w.user.name.charAt(0).toUpperCase() : 'W'}
                          </div>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', display: 'block' }}>
                              {w.user?.name || 'Worker'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {w.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', color: '#334155' }}>{w.user?.email || '—'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{w.user?.phone || '—'}</div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>{getStatusBadge(w.verificationStatus)}</td>

                      {/* Services/Skills */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>
                          {(w.services || w.workerServices)?.length || 0} service{(w.services || w.workerServices)?.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {(w.skills || w.workerSkills)?.length || 0} skill{(w.skills || w.workerSkills)?.length !== 1 ? 's' : ''} registered
                        </div>
                      </td>

                      {/* Experience */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', color: '#334155' }}>
                          {w.experienceYears ? `${w.experienceYears} Years` : 'Fresher / Entry'}
                        </span>
                      </td>

                      {/* Registered */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                          {new Date(w.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/workers/${w.id}`)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>Review</span>
                            <ArrowRight size={13} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/workers/${w.id}`)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              fontSize: '12.5px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                    <HardHat size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                      No workers found
                    </p>
                    <span style={{ fontSize: '13px' }}>
                      {statusFilter !== 'ALL'
                        ? `No workers match the status filter: ${statusFilter}`
                        : 'No workers have registered on the platform yet.'}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '12px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '12.5px',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Showing {workers.length} workers</span>
          <span>Total registered workers: {total}</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminWorkers;
