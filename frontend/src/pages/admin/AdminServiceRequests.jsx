import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import adminApi from '../../services/admin.api';
import {
  ClipboardList,
  Search,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const AdminServiceRequests = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServiceRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await adminApi.getServiceRequests(params);
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
        setTotal(res.total || res.data.length);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load service requests.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchServiceRequests();
  }, [fetchServiceRequests]);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    if (status === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const getStatusBadge = (status) => {
    const map = {
      OPEN: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      MATCHED: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
      COMPLETED: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
      CANCELLED: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
    };

    const s = map[status] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };

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
          background: s.bg,
          color: s.text,
          border: `1px solid ${s.border}`,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <AdminLayout
      title="Service Requests"
      subtitle="Monitor customer demand, pending matchmaking requests, and fulfillment status"
    >
      {/* Search & Filters */}
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
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by customer, service, category, or city..."
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
          />
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'OPEN', 'MATCHED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => handleStatusChange(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: statusFilter === st ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: statusFilter === st ? '#eff6ff' : '#ffffff',
                color: statusFilter === st ? '#1d4ed8' : '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              {st === 'ALL' ? 'All Requests' : st}
            </button>
          ))}

          <button
            type="button"
            onClick={fetchServiceRequests}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
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
            padding: '12px 16px',
            marginBottom: '18px',
            color: '#b91c1c',
            fontSize: '13.5px',
          }}
        >
          {error}
        </div>
      )}

      {/* Requests Table */}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '820px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Request
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Customer
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Location
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Requested Timing
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Submitted
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td colSpan={6} style={{ padding: '18px 20px' }}>
                      <div style={{ height: '24px', background: '#f8fafc', borderRadius: '6px' }} />
                    </td>
                  </tr>
                ))
              ) : requests.length > 0 ? (
                requests.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', display: 'block' }}>
                        {r.serviceName}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>Category: {r.category}</span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        {r.customer?.name || 'Customer'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {r.customer?.phone || r.customer?.email}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#64748b" />
                        <span>{r.area}, {r.city}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Pincode: {r.pincode}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', color: '#334155' }}>
                        {new Date(r.requestedDate).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{r.requestedTime}</div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748b' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {getStatusBadge(r.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                    <ClipboardList size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                      No service requests found
                    </p>
                    <span style={{ fontSize: '13px' }}>
                      {statusFilter !== 'ALL'
                        ? `No service requests with status: ${statusFilter}`
                        : 'No customer service requests registered yet.'}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: '12px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '12.5px',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Showing {requests.length} service requests</span>
          <span>Total requests recorded: {total}</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServiceRequests;
