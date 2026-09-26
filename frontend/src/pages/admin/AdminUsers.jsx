import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminApi from '../../services/admin.api';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal for status change confirmation
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetStatus, setTargetStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await adminApi.getUsers(params);
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
        setTotal(res.total || res.data.length);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users list.');
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const confirmStatusChange = (user, newStatus) => {
    setSelectedUser(user);
    setTargetStatus(newStatus);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser || !targetStatus) return;

    try {
      setIsProcessing(true);
      setError(null);
      setActionSuccess(null);
      const res = await adminApi.updateUserStatus(selectedUser.id, targetStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, status: targetStatus } : u))
        );
        setActionSuccess(`User status updated to ${targetStatus}`);
        setSelectedUser(null);
        setTargetStatus(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
            }}
          >
            ADMIN
          </span>
        );
      case 'WORKER':
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
          >
            WORKER
          </span>
        );
      case 'CUSTOMER':
      default:
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              background: '#f8fafc',
              color: '#475569',
              border: '1px solid #e2e8f0',
            }}
          >
            CUSTOMER
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: 600,
              background: '#dcfce7',
              color: '#15803d',
            }}
          >
            <CheckCircle size={12} />
            ACTIVE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: 600,
              background: '#fee2e2',
              color: '#b91c1c',
            }}
          >
            <AlertTriangle size={12} />
            SUSPENDED
          </span>
        );
      case 'INACTIVE':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: 600,
              background: '#f1f5f9',
              color: '#475569',
            }}
          >
            <XCircle size={12} />
            INACTIVE
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle="Manage registered accounts, roles, access statuses, and security privileges"
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
            placeholder="Search by name, email, or phone..."
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

        {/* Role & Status Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="WORKER">Worker</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <button
            type="button"
            onClick={fetchUsers}
            style={{
              padding: '8px 12px',
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

      {/* Success notification */}
      {actionSuccess && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '18px',
            color: '#15803d',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          ✓ {actionSuccess}
        </div>
      )}

      {/* Error notification */}
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

      {/* Users Table */}
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
                  User
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Contact
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Role
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Registered
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Last Login
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
              ) : users.length > 0 ? (
                users.map((u) => {
                  const isAdmin = u.role === 'ADMIN';
                  const isCurrentAdmin = u.id === currentUser?.userId || u.id === currentUser?.id;
                  const isSuspended = u.status === 'SUSPENDED';

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Name */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: isAdmin ? '#1e3a8a' : '#eff6ff',
                              color: isAdmin ? '#ffffff' : '#1d4ed8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', display: 'block' }}>
                              {u.name || 'Unnamed User'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {u.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', color: '#334155' }}>{u.email}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{u.phone || '—'}</div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 16px' }}>{getRoleBadge(u.role)}</td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>{getStatusBadge(u.status)}</td>

                      {/* Created date */}
                      <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748b' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Last login */}
                      <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748b' }}>
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {isAdmin || isCurrentAdmin ? (
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Protected
                          </span>
                        ) : isSuspended ? (
                          <button
                            type="button"
                            onClick={() => confirmStatusChange(u, 'ACTIVE')}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Reactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => confirmStatusChange(u, 'SUSPENDED')}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                    <Users size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                      No users found
                    </p>
                    <span style={{ fontSize: '13px' }}>Try adjusting your filters or search keywords.</span>
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
          <span>Showing {users.length} users</span>
          <span>Total platform users: {total}</span>
        </div>
      </div>

      {/* Status Confirmation Modal */}
      {selectedUser && targetStatus && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
              Confirm Status Change
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              Are you sure you want to change the status of <strong>{selectedUser.name}</strong> to{' '}
              <strong style={{ color: targetStatus === 'SUSPENDED' ? '#dc2626' : '#16a34a' }}>
                {targetStatus}
              </strong>
              ?
              {targetStatus === 'SUSPENDED' &&
                ' Suspended users will not be able to log in or create/accept bookings.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setTargetStatus(null);
                }}
                disabled={isProcessing}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isProcessing}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: targetStatus === 'SUSPENDED' ? '#dc2626' : '#16a34a',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isProcessing ? 'Updating...' : `Confirm ${targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
