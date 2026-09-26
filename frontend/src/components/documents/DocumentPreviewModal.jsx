import React from 'react';
import { X, FileText, Download, Calendar, CheckCircle2, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import documentApi from '../../services/document.api';

export const DocumentPreviewModal = ({ document, isOpen, onClose, isAdmin = false }) => {
  if (!isOpen || !document) return null;

  const fileUrl = isAdmin
    ? documentApi.getAdminDocumentFileUrl(document.id)
    : documentApi.getWorkerDocumentFileUrl(document.id);

  const isPdf = document.mimeType === 'application/pdf' || document.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = document.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(document.fileName || '');

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
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '780px',
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
            padding: '20px 24px',
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
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {document.fileName}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                {document.documentType?.replace(/_/g, ' ')} • {formatSize(document.fileSize)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={document.fileName}
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
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <Download size={15} />
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
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
            minHeight: '380px',
          }}
        >
          {isImage ? (
            <img
              src={fileUrl}
              alt={document.fileName}
              style={{
                maxWidth: '100%',
                maxHeight: '520px',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                background: '#ffffff',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement.querySelector('.preview-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : isPdf ? (
            <iframe
              src={`${fileUrl}#toolbar=0`}
              title={document.fileName}
              style={{
                width: '100%',
                height: '520px',
                border: 'none',
                borderRadius: '12px',
                background: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          ) : null}

          {/* Fallback for preview or missing seeded file */}
          <div
            className="preview-fallback"
            style={{
              display: isImage || isPdf ? 'none' : 'flex',
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
              Preview is not rendered directly in this browser frame. You can open or download the original file to view it.
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
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
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={16} />
              Open In New Tab
            </a>
          </div>
        </div>

        {/* Modal Footer / Metadata */}
        <div
          style={{
            padding: '16px 24px',
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
