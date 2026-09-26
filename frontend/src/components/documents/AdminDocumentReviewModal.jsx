import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import documentApi from '../../services/document.api';

export const AdminDocumentReviewModal = ({
  isOpen,
  document,
  onClose,
  onVerify,
  onReject,
}) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [confirmVerify, setConfirmVerify] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const activeBlobUrlRef = useRef(null);

  const cleanupObjectUrl = () => {
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setObjectUrl(null);
  };

  const handleClose = () => {
    cleanupObjectUrl();
    setConfirmVerify(false);
    setVerifyError('');
    onClose();
  };

  const loadDocumentBlob = async () => {
    if (!document?.id) return;

    cleanupObjectUrl();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const blob = await documentApi.viewAdminDocument(document.id);
      const url = URL.createObjectURL(blob);
      activeBlobUrlRef.current = url;
      setObjectUrl(url);
    } catch (err) {
      console.error('Failed to load admin document preview:', err);
      setErrorMessage('Unable to load document');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && document?.id) {
      loadDocumentBlob();
    } else {
      cleanupObjectUrl();
      setErrorMessage('');
      setConfirmVerify(false);
      setVerifyError('');
    }

    return () => {
      cleanupObjectUrl();
    };
  }, [isOpen, document?.id]);

  if (!isOpen || !document) return null;

  const mime = (document.mimeType || '').toLowerCase();
  const fileName = (document.fileName || '').toLowerCase();

  const isPdf = mime === 'application/pdf' || fileName.endsWith('.pdf');
  const isImage =
    mime.startsWith('image/') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png');

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
      handleClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to verify document. Please try again.';
      setVerifyError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const blob = await documentApi.downloadAdminDocument(document.id);
      const downloadUrl = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = downloadUrl;
      a.download = document.fileName || 'document';
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Unable to download document file.');
    } finally {
      setIsDownloading(false);
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
      onClick={handleClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '960px',
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
            padding: '18px 28px',
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
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                Document Verification Review
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Review submitted worker credentials and make approval or rejection decisions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
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
            title="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Content - Two Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(320px, 0.75fr)',
            flex: 1,
            overflowY: 'auto',
            minHeight: '440px',
            maxHeight: 'calc(92vh - 140px)',
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
              minHeight: '400px',
            }}
          >
            {/* Loading state */}
            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  color: '#64748b',
                }}
              >
                <Loader2 size={36} color="#2563eb" className="animate-spin" />
                <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600 }}>Loading document preview...</p>
              </div>
            )}

            {/* Error state */}
            {!isLoading && errorMessage && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #fee2e2',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  maxWidth: '400px',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#dc2626',
                    marginBottom: '12px',
                  }}
                >
                  <AlertTriangle size={26} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#991b1b' }}>
                  Unable to load document
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>
                  Could not retrieve the file from storage. Please check connection and try again.
                </p>
                <button
                  type="button"
                  onClick={loadDocumentBlob}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
              </div>
            )}

            {/* Success state - Image Preview */}
            {!isLoading && !errorMessage && objectUrl && isImage && (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={objectUrl}
                  alt={document.fileName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '52vh',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    background: '#ffffff',
                    display: 'block',
                  }}
                />
              </div>
            )}

            {/* Success state - PDF Preview */}
            {!isLoading && !errorMessage && objectUrl && isPdf && (
              <iframe
                src={`${objectUrl}#toolbar=0`}
                title={document.fileName}
                style={{
                  width: '100%',
                  height: '52vh',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            )}

            {/* Fallback for other file types */}
            {!isLoading && !errorMessage && objectUrl && !isImage && !isPdf && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '36px',
                  textAlign: 'center',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px dashed #cbd5e1',
                  maxWidth: '380px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <FileText size={28} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  {document.fileName}
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>
                  Direct preview not supported for {document.mimeType}. Please download the file to inspect it.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  Download File
                </button>
              </div>
            )}

            {/* Download Original Link */}
            {!isLoading && !errorMessage && (
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
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
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {isDownloading ? 'Downloading...' : 'Download Original'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Worker Info, Document Details, Verification Actions */}
          <div
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              background: '#ffffff',
              overflowY: 'auto',
            }}
          >
            {/* Worker Profile Card */}
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
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {document.worker?.name ? document.worker.name.charAt(0).toUpperCase() : <User size={18} />}
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
                      Profile: {document.worker?.workerVerificationStatus || 'PENDING'}
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
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Verified On</span>
                    <span style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                      {formatDate(document.verifiedAt)}
                    </span>
                  </div>
                )}

                {document.verificationStatus === 'REJECTED' && document.rejectionReason && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '10px 12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      color: '#991b1b',
                    }}
                  >
                    <strong>Reason for Rejection:</strong>
                    <div style={{ marginTop: '2px' }}>{document.rejectionReason}</div>
                  </div>
                )}
              </div>
            </div>

            {/* In-Line Confirmation Dialog */}
            {confirmVerify && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h5 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#166534' }}>
                      Confirm Verification Approval
                    </h5>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#15803d' }}>
                      Are you sure you want to approve this {document.documentType?.replace(/_/g, ' ')}? This marks the document as verified.
                    </p>
                  </div>
                </div>

                {verifyError && (
                  <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                    {verifyError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
                      fontSize: '13px',
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
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: isVerifying ? 'not-allowed' : 'pointer',
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
            onClick={handleClose}
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
