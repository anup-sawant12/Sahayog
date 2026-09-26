import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import documentApi from '../../services/document.api';
import AdminDocumentReviewModal from '../../components/documents/AdminDocumentReviewModal';
import AdminDocumentRejectModal from '../../components/documents/AdminDocumentRejectModal';
import Loader from '../../components/common/Loader';
import {
  FileText,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Users,
  Download,
} from 'lucide-react';

const DOCUMENT_TYPE_LABELS = {
  IDENTITY_PROOF: 'Identity Proof',
  PAN_CARD: 'PAN Card',
  ADDRESS_PROOF: 'Address Proof',
  TRADE_CERTIFICATE: 'Trade Certificate',
  POLICE_VERIFICATION: 'Police Verification',
};

export const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  // Filters state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await documentApi.getAdminDocumentStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load document stats:', err);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (statusFilter !== 'ALL') params.verificationStatus = statusFilter;
      if (typeFilter !== 'ALL') params.documentType = typeFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await documentApi.getAdminDocuments(params);

      if (response.success) {
        setDocuments(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to load verification documents. Please check your connection.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const showSuccess = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner('');
    }, 4500);
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setSearchTerm('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOpenReview = (doc) => {
    setSelectedDoc(doc);
    setReviewModalOpen(true);
  };

  const handleOpenReject = (doc) => {
    setSelectedDoc(doc);
    setRejectModalOpen(true);
  };

  const handleQuickVerify = async (doc) => {
    try {
      const res = await documentApi.verifyDocument(doc.id);
      if (res.success) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? { ...d, verificationStatus: 'VERIFIED', verifiedAt: res.data.verifiedAt }
              : d
          )
        );
        fetchStats();
        showSuccess(`Document for ${doc.worker?.name || 'Worker'} verified successfully.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    }
  };

  const handleVerifySuccess = (updatedDoc) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === updatedDoc.id
          ? {
              ...d,
              verificationStatus: updatedDoc.verificationStatus,
              verifiedAt: updatedDoc.verifiedAt,
            }
          : d
      )
    );
    fetchStats();
    showSuccess('Document successfully verified.');
  };

  const handleRejectSuccess = (updatedDoc) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === updatedDoc.id
          ? {
              ...d,
              verificationStatus: updatedDoc.verificationStatus,
              rejectionReason: updatedDoc.rejectionReason,
              verifiedAt: null,
            }
          : d
      )
    );
    fetchStats();
    showSuccess('Document has been marked as rejected.');
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout
      title="KYC Verification"
      subtitle="Review and verify worker credentials and compliance documents"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
        {/* Success Alert Banner */}
        {successBanner && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#15803d',
              fontSize: '13.5px',
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#b91c1c',
              fontSize: '13.5px',
            }}
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 2. Statistics Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Total Documents */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Total Documents</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {stats.total}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} />
            </div>
          </div>

          {/* Pending */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #f59e0b',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Pending Verification</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                {stats.pending}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={22} />
            </div>
          </div>

          {/* Verified */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #10b981',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Verified</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {stats.verified}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#dcfce7',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
          </div>

          {/* Rejected */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #ef4444',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Rejected</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
                {stats.rejected}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fee2e2',
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        {/* 3. Filter Bar */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '18px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', flex: 1 }}>
            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                minWidth: '240px',
                flex: 1,
                maxWidth: '360px',
              }}
            >
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search worker name, email, phone..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Verification Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13px',
                  color: '#0f172a',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Document Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13px',
                  color: '#0f172a',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Document Types</option>
                <option value="IDENTITY_PROOF">Identity Proof</option>
                <option value="PAN_CARD">PAN Card</option>
                <option value="ADDRESS_PROOF">Address Proof</option>
                <option value="TRADE_CERTIFICATE">Trade Certificate</option>
                <option value="POLICE_VERIFICATION">Police Verification</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {/* 4. Documents Table */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader message="Loading verification documents..." />
            </div>
          ) : documents.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <FileText size={28} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                No Documents Found
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                No worker documents match your current filter and search criteria.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Worker
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Document
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Document Type
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Status
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Uploaded
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Verification Date
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      {/* Worker Info */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {doc.worker?.name ? doc.worker.name.charAt(0).toUpperCase() : 'W'}
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                              {doc.worker?.name || 'Worker'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {doc.worker?.email || doc.worker?.phone || 'No contact'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Document Details */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.fileName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                          {formatFileSize(doc.fileSize)} • {doc.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </div>
                      </td>

                      {/* Document Type */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td style={{ padding: '16px 20px' }}>
                        {doc.verificationStatus === 'VERIFIED' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 9px',
                              borderRadius: '9999px',
                              background: '#dcfce7',
                              color: '#166534',
                              fontSize: '11.5px',
                              fontWeight: 700,
                            }}
                          >
                            <CheckCircle2 size={13} />
                            VERIFIED
                          </span>
                        )}
                        {doc.verificationStatus === 'PENDING' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 9px',
                              borderRadius: '9999px',
                              background: '#fef3c7',
                              color: '#92400e',
                              fontSize: '11.5px',
                              fontWeight: 700,
                            }}
                          >
                            <Clock size={13} />
                            PENDING
                          </span>
                        )}
                        {doc.verificationStatus === 'REJECTED' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 9px',
                              borderRadius: '9999px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              fontSize: '11.5px',
                              fontWeight: 700,
                            }}
                          >
                            <AlertTriangle size={13} />
                            REJECTED
                          </span>
                        )}
                      </td>

                      {/* Upload Date */}
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                        {formatDate(doc.createdAt)}
                      </td>

                      {/* Verification Date */}
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: doc.verifiedAt ? '#059669' : '#94a3b8' }}>
                        {formatDate(doc.verifiedAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenReview(doc)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={13} />
                            View Document
                          </button>

                          {doc.verificationStatus === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleQuickVerify(doc)}
                                title="Quick Verify"
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: '8px',
                                  background: '#dcfce7',
                                  border: '1px solid #bbf7d0',
                                  color: '#166534',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Check size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenReject(doc)}
                                title="Reject Document"
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: '8px',
                                  background: '#fee2e2',
                                  border: '1px solid #fecaca',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} documents
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: pagination.page <= 1 ? '#cbd5e1' : '#334155',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: pagination.page >= pagination.totalPages ? '#cbd5e1' : '#334155',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <AdminDocumentReviewModal
        isOpen={reviewModalOpen}
        document={selectedDoc}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedDoc(null);
        }}
        onVerify={handleVerifySuccess}
        onReject={(doc) => {
          setReviewModalOpen(false);
          handleOpenReject(doc);
        }}
      />

      {/* Reject Modal */}
      <AdminDocumentRejectModal
        isOpen={rejectModalOpen}
        document={selectedDoc}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedDoc(null);
        }}
        onSuccess={handleRejectSuccess}
      />
    </AdminLayout>
  );
};

export default AdminDocuments;
