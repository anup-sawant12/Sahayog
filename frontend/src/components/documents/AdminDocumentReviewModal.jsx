import React, { useState } from 'react';
import {
  X,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import documentApi from '../../services/document.api';

export const AdminDocumentReviewModal = ({
  isOpen,
  document,
  onClose,
  onVerify,
  onReject,
}) => {
  const [confirmVerify, setConfirmVerify] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  if (!isOpen || !document) return null;

  const fileUrl = documentApi.getAdminDocumentFileUrl(document.id);
  const isPdf = document.mimeType === 'application/pdf' || document.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = document.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(document.fileName || '');

  const formatSize = (bytes) => {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExecuteVerify = async () => {
    setIsVerifying(true);
    setVerifyError('');

    try {
      const response = await documentApi.verifyDocument(document.id);
      if (onVerify) {
        onVerify(response.data);
      }
      setConfirmVerify(false);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to verify document. Please try again.';
      setVerifyError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                Document Verification Review
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Review submitted worker credentials and make approval or rejection decisions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Content - Two Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
            flex: 1,
            overflowY: 'auto',
            minHeight: '440px',
          }}
          className="admin-review-grid"
        >
          {/* Left Column: Document File Preview */}
          <div
            style={{
              background: '#f8fafc',
              borderRight: '1px solid #e2e8f0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isImage ? (
              <img
                src={fileUrl}
                alt={document.fileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '480px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  background: '#ffffff',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.parentElement.querySelector('.admin-preview-fallback');
                  if (fb) fb.style.display = 'flex';
                }}
              />
            ) : isPdf ? (
              <iframe
                src={`${fileUrl}#toolbar=0`}
                title={document.fileName}
                style={{
                  width: '100%',
                  height: '480px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            ) : null}

            {/* Fallback */}
            <div
              className="admin-preview-fallback"
              style={{
                display: isImage || isPdf ? 'none' : 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px',
                textAlign: 'center',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px dashed #cbd5e1',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <FileText size={30} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                {document.fileName}
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>
                Direct preview not supported in this frame. Open in a new browser tab or download file.
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={15} />
                Open File
              </a>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={document.fileName}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Download size={14} />
                Download Original
              </a>
            </div>
          </div>

          {/* Right Column: Worker and Document Information */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Worker Information Card */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748b',
                  marginBottom: '10px',
                }}
              >
                Worker Profile
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      fontSize: '16px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {document.worker?.name ? document.worker.name.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                      {document.worker?.name || 'Worker'}
                    </h4>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color:
                          document.worker?.workerVerificationStatus === 'APPROVED'
                            ? '#059669'
                            : '#d97706',
                      }}
                    >
                      Profile Verification: {document.worker?.workerVerificationStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={15} color="#94a3b8" />
                    <span>{document.worker?.email || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={15} color="#94a3b8" />
                    <span>{document.worker?.phone || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Metadata Card */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748b',
                  marginBottom: '10px',
                }}
              >
                Document Details
              </div>

              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Type</span>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                    {document.documentType?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Filename</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {document.fileName}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Format / MIME</span>
                  <span style={{ fontSize: '13px', color: '#334155' }}>{document.mimeType}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>File Size</span>
                  <span style={{ fontSize: '13px', color: '#334155' }}>{formatSize(document.fileSize)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Uploaded At</span>
                  <span style={{ fontSize: '13px', color: '#334155' }}>{formatDate(document.createdAt)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Current Status</span>
                  <span>
                    {document.verificationStatus === 'VERIFIED' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: '#dcfce7',
                          color: '#166534',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={13} />
                        VERIFIED
                      </span>
                    )}
                    {document.verificationStatus === 'PENDING' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: '#fef3c7',
                          color: '#92400e',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        <Clock size={13} />
                        PENDING
                      </span>
                    )}
                    {document.verificationStatus === 'REJECTED' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        <AlertTriangle size={13} />
                        REJECTED
                      </span>
                    )}
                  </span>
                </div>

                {document.verifiedAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Verified Date</span>
                    <span style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                      {formatDate(document.verifiedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason Notice if applicable */}
            {document.verificationStatus === 'REJECTED' && document.rejectionReason && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#991b1b',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                  <AlertTriangle size={16} />
                  Rejection Reason:
                </div>
                <div>{document.rejectionReason}</div>
              </div>
            )}

            {verifyError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#b91c1c',
                  fontSize: '12.5px',
                }}
              >
                {verifyError}
              </div>
            )}

            {/* Verification Confirmation Box */}
            {confirmVerify && (
              <div
                style={{
                  background: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#1e40af' }}>
                  Confirm Verification
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#3b82f6' }}>
                  Are you sure you want to mark this document as <strong>VERIFIED</strong>?
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setConfirmVerify(false)}
                    disabled={isVerifying}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteVerify}
                    disabled={isVerifying}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '8px',
                      background: '#16a34a',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Yes, Verify Now'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Panel
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Reject Document Button */}
            <button
              type="button"
              onClick={() => onReject(document)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldAlert size={16} />
              Reject Document
            </button>

            {/* Verify Document Button */}
            {!confirmVerify && (
              <button
                type="button"
                onClick={() => setConfirmVerify(true)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  background: '#16a34a',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.25)',
                }}
              >
                <ShieldCheck size={16} />
                Verify Document
              </button>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .admin-review-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminDocumentReviewModal;
