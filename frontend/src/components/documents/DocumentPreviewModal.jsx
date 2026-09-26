import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import documentApi from '../../services/document.api';

export const DocumentPreviewModal = ({
  document,
  isOpen,
  onClose,
  isAdmin = false,
}) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const activeBlobUrlRef = useRef(null);

  // Revoke object URL helper
  const cleanupObjectUrl = () => {
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setObjectUrl(null);
  };

  const handleClose = () => {
    cleanupObjectUrl();
    onClose();
  };

  const loadDocumentBlob = async () => {
    if (!document?.id) return;

    cleanupObjectUrl();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const blob = isAdmin
        ? await documentApi.viewAdminDocument(document.id)
        : await documentApi.viewWorkerDocument(document.id);

      const url = URL.createObjectURL(blob);
      activeBlobUrlRef.current = url;
      setObjectUrl(url);
    } catch (err) {
      console.error('Failed to load document preview:', err);
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
    }

    return () => {
      cleanupObjectUrl();
    };
  }, [isOpen, document?.id, isAdmin]);

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
    if (!bytes && bytes !== 0) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const blob = isAdmin
        ? await documentApi.downloadAdminDocument(document.id)
        : await documentApi.downloadWorkerDocument(document.id);

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
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                flexShrink: 0,
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#0f172a',
                  maxWidth: '480px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {document.fileName}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                {document.documentType?.replace(/_/g, ' ')} • {formatSize(document.fileSize)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isLoading}
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
                cursor: isDownloading || isLoading ? 'not-allowed' : 'pointer',
                opacity: isDownloading || isLoading ? 0.6 : 1,
              }}
            >
              {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body / Document Preview Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            background: '#f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '420px',
            maxHeight: 'calc(90vh - 140px)',
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
                padding: '40px',
              }}
            >
              <Loader2 size={36} color="#0284c7" className="animate-spin" />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Loading document preview...</p>
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
                padding: '36px 24px',
                textAlign: 'center',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #fee2e2',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                maxWidth: '440px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  marginBottom: '14px',
                }}
              >
                <AlertTriangle size={28} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>
                Unable to load document
              </h4>
              <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b' }}>
                The document file could not be retrieved from storage. Please verify your connection or try again.
              </p>
              <button
                type="button"
                onClick={loadDocumentBlob}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={15} />
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
                  maxHeight: '62vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
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
                height: '62vh',
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
                padding: '40px',
                textAlign: 'center',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px dashed #cbd5e1',
                maxWidth: '440px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                  marginBottom: '16px',
                }}
              >
                <FileText size={32} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {document.fileName}
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                This file format ({document.mimeType}) cannot be directly previewed in the browser. You can download the file to view it.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Download size={16} />
                Download Document
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer / Metadata */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} />
              Uploaded: {formatDate(document.createdAt)}
            </span>
            {document.verifiedAt && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
                <CheckCircle2 size={15} />
                Verified: {formatDate(document.verifiedAt)}
              </span>
            )}
          </div>

          <div>
            {document.verificationStatus === 'VERIFIED' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: '#dcfce7',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={14} />
                VERIFIED
              </span>
            )}
            {document.verificationStatus === 'PENDING' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <Clock size={14} />
                PENDING REVIEW
              </span>
            )}
            {document.verificationStatus === 'REJECTED' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <AlertTriangle size={14} />
                REJECTED
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
