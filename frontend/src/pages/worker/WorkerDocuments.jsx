import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileQuestion,
  Eye,
  Trash2,
  RefreshCw,
  Plus,
  ShieldCheck,
  Info,
  Calendar,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import documentApi from '../../services/document.api';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';
import DocumentPreviewModal from '../../components/documents/DocumentPreviewModal';
import DeleteDocumentModal from '../../components/documents/DeleteDocumentModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const REQUIRED_DOCUMENTS = [
  {
    type: 'IDENTITY_PROOF',
    title: 'Identity Proof',
    category: 'Mandatory',
    description: 'Government photo identification (Aadhaar Card, Voter ID, Passport, or Driving License)',
  },
  {
    type: 'PAN_CARD',
    title: 'PAN Card',
    category: 'Mandatory',
    description: 'Permanent Account Number card for tax, banking, and cooperative payout compliance',
  },
  {
    type: 'ADDRESS_PROOF',
    title: 'Address Proof',
    category: 'Mandatory',
    description: 'Utility bill, Ration Card, or legal rental agreement verifying residential address',
  },
  {
    type: 'TRADE_CERTIFICATE',
    title: 'Trade Certificate',
    category: 'Skill Verification',
    description: 'ITI, Vocational diploma, or technical certification proving trade competency',
  },
  {
    type: 'POLICE_VERIFICATION',
    title: 'Police Verification',
    category: 'Security & Trust',
    description: 'Police clearance record or character certificate ensuring safety on customer premises',
  },
];

export const WorkerDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadPreselectedType, setUploadPreselectedType] = useState(null);
  const [isReplacementMode, setIsReplacementMode] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await documentApi.getMyDocuments();
      if (response.success && Array.isArray(response.data)) {
        setDocuments(response.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 404
          ? 'Worker profile not found. Please complete your worker profile first.'
          : null) ||
        'Unable to load your documents. Please check your network connection.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const showNotification = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner('');
    }, 4500);
  };

  // Map uploaded documents by type for fast lookup
  const docsByType = useMemo(() => {
    const map = {};
    for (const doc of documents) {
      map[doc.documentType] = doc;
    }
    return map;
  }, [documents]);

  // Statistics
  const stats = useMemo(() => {
    let verified = 0;
    let pending = 0;
    let rejected = 0;

    for (const doc of documents) {
      if (doc.verificationStatus === 'VERIFIED') verified++;
      else if (doc.verificationStatus === 'PENDING') pending++;
      else if (doc.verificationStatus === 'REJECTED') rejected++;
    }

    const uploadedCount = Object.keys(docsByType).length;
    const notUploaded = Math.max(0, REQUIRED_DOCUMENTS.length - uploadedCount);

    return { verified, pending, rejected, notUploaded, totalRequired: REQUIRED_DOCUMENTS.length };
  }, [documents, docsByType]);

  const handleOpenUpload = (type = null, isReplace = false) => {
    setUploadPreselectedType(type);
    setIsReplacementMode(isReplace);
    setUploadModalOpen(true);
  };

  const handleOpenPreview = (doc) => {
    setSelectedDoc(doc);
    setPreviewModalOpen(true);
  };

  const handleOpenDelete = (doc) => {
    setSelectedDoc(doc);
    setDeleteModalOpen(true);
  };

  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== newDoc.id && d.documentType !== newDoc.documentType);
      return [newDoc, ...filtered];
    });
    showNotification(`Document for ${newDoc.documentType?.replace(/_/g, ' ')} uploaded successfully!`);
  };

  const handleDeleteSuccess = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showNotification('Document removed successfully.');
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '36px 20px', textAlign: 'left' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Breadcrumb / Top Return Link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <Link
            to="/worker/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#0d9488',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f0fdfa',
              transition: 'background 0.15s ease',
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            Worker Compliance & Verification Portal
          </span>
        </div>

        {/* 1. KYC Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
            borderRadius: '20px',
            padding: '32px',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.25)',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <ShieldCheck size={36} />
            </div>

            <div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#99f6e4',
                }}
              >
                Worker Identity & Trust
              </span>
              <h1
                style={{
                  margin: '4px 0 6px',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                KYC & Documents
              </h1>
              <p style={{ margin: 0, fontSize: '14.5px', color: '#ccfbf1', maxWidth: '600px' }}>
                Documents are required for worker verification. Verified workers enjoy prioritized customer matching, verified badges, and trusted payouts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenUpload()}
            style={{
              padding: '12px 22px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#0f766e',
              border: 'none',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <UploadCloud size={18} />
            Upload Document
          </button>
        </div>

        {/* Success Alert Banner */}
        {successBanner && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#15803d',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 2px 4px rgba(22, 101, 52, 0.05)',
            }}
          >
            <CheckCircle2 size={20} />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#b91c1c',
              fontSize: '14px',
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* 2. Verification Summary (4 Cards) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Verified Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px 24px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #10b981',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Verified</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
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

          {/* Pending Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px 24px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #f59e0b',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Pending Review</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
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

          {/* Rejected Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px 24px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #ef4444',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Rejected</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
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

          {/* Not Uploaded Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px 24px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #94a3b8',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Not Uploaded</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {stats.notUploaded}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileQuestion size={22} />
            </div>
          </div>
        </div>

        {/* 3. Required Documents Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Required Verification Documents
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
                Submit all 5 compliance documents to complete full profile verification
              </p>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f766e', background: '#f0fdfa', padding: '6px 14px', borderRadius: '9999px', border: '1px solid #ccfbf1' }}>
              {stats.verified} of {REQUIRED_DOCUMENTS.length} Verified
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <Loader message="Loading verification documents..." />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {REQUIRED_DOCUMENTS.map((reqDoc) => {
                const doc = docsByType[reqDoc.type];
                const status = doc ? doc.verificationStatus : 'NOT_UPLOADED';

                return (
                  <div
                    key={reqDoc.type}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border:
                        status === 'VERIFIED'
                          ? '1.5px solid #bbf7d0'
                          : status === 'REJECTED'
                          ? '1.5px solid #fecaca'
                          : status === 'PENDING'
                          ? '1.5px solid #fde68a'
                          : '1px solid #e2e8f0',
                      padding: '24px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}
                    >
                      {/* Left: Document Info */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1, minWidth: '260px' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background:
                              status === 'VERIFIED'
                                ? '#dcfce7'
                                : status === 'REJECTED'
                                ? '#fee2e2'
                                : status === 'PENDING'
                                ? '#fef3c7'
                                : '#f1f5f9',
                            color:
                              status === 'VERIFIED'
                                ? '#166534'
                                : status === 'REJECTED'
                                ? '#b91c1c'
                                : status === 'PENDING'
                                ? '#b45309'
                                : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={24} />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 700, color: '#0f172a' }}>
                              {reqDoc.title}
                            </h3>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {reqDoc.category}
                            </span>
                          </div>

                          <p style={{ margin: '4px 0 8px', fontSize: '13px', color: '#64748b' }}>
                            {reqDoc.description}
                          </p>

                          {/* Uploaded File Metadata */}
                          {doc ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '12.5px', color: '#475569', marginTop: '8px' }}>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                File: {doc.fileName}
                              </span>
                              <span>Size: {formatFileSize(doc.fileSize)}</span>
                              <span>Uploaded: {formatDate(doc.createdAt)}</span>
                              {doc.verifiedAt && (
                                <span style={{ color: '#059669', fontWeight: 600 }}>
                                  Verified: {formatDate(doc.verifiedAt)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: '6px' }}>
                              No file uploaded yet. Click "Upload Now" to submit this document.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Status Badge & Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                        {/* Status Badge */}
                        {status === 'VERIFIED' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              background: '#dcfce7',
                              color: '#166534',
                              fontSize: '12.5px',
                              fontWeight: 700,
                            }}
                          >
                            <CheckCircle2 size={15} />
                            VERIFIED
                          </span>
                        )}

                        {status === 'PENDING' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              background: '#fef3c7',
                              color: '#92400e',
                              fontSize: '12.5px',
                              fontWeight: 700,
                            }}
                          >
                            <Clock size={15} />
                            UNDER REVIEW
                          </span>
                        )}

                        {status === 'REJECTED' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              fontSize: '12.5px',
                              fontWeight: 700,
                            }}
                          >
                            <AlertTriangle size={15} />
                            REJECTED
                          </span>
                        )}

                        {status === 'NOT_UPLOADED' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              background: '#f1f5f9',
                              color: '#475569',
                              fontSize: '12.5px',
                              fontWeight: 600,
                            }}
                          >
                            <Info size={15} />
                            NOT UPLOADED
                          </span>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {doc && (
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(doc)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 12px',
                                borderRadius: '8px',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          )}

                          {status === 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => handleOpenUpload(reqDoc.type, true)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                background: '#b91c1c',
                                border: 'none',
                                color: '#ffffff',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(185, 28, 28, 0.2)',
                              }}
                            >
                              <RefreshCw size={14} />
                              Replace Document
                            </button>
                          )}

                          {status === 'NOT_UPLOADED' && (
                            <button
                              type="button"
                              onClick={() => handleOpenUpload(reqDoc.type, false)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                background: '#0d9488',
                                border: 'none',
                                color: '#ffffff',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)',
                              }}
                            >
                              <Plus size={14} />
                              Upload Now
                            </button>
                          )}

                          {doc && status !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(doc)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                background: 'transparent',
                                border: '1px solid #e2e8f0',
                                color: '#94a3b8',
                                fontSize: '12.5px',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#dc2626';
                                e.currentTarget.style.borderColor = '#fecaca';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#94a3b8';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                              title="Delete document"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rejection Notice Banner */}
                    {status === 'REJECTED' && doc.rejectionReason && (
                      <div
                        style={{
                          marginTop: '16px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          color: '#991b1b',
                          fontSize: '13px',
                        }}
                      >
                        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Rejection Reason:</strong> {doc.rejectionReason}
                          <div style={{ marginTop: '4px', fontSize: '12px', color: '#b91c1c' }}>
                            Please review the feedback above and submit a clear, valid replacement document.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        existingDocuments={documents}
        preselectedType={uploadPreselectedType}
        isReplacement={isReplacementMode}
      />

      <DocumentPreviewModal
        isOpen={previewModalOpen}
        document={selectedDoc}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedDoc(null);
        }}
        isAdmin={false}
      />

      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        document={selectedDoc}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedDoc(null);
        }}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default WorkerDocuments;
