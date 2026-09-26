import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import documentApi from '../../services/document.api';

export const AdminDocumentRejectModal = ({ isOpen, document, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !document) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Rejection reason is required.');
      return;
    }

    if (reason.trim().length < 5) {
      setError('Please provide a specific rejection reason (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await documentApi.rejectDocument(document.id, reason.trim());
      if (onSuccess) {
        onSuccess(response.data);
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to reject document. Please check your network connection and try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
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
        zIndex: 1100,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fff1f2',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#991b1b' }}>
                Reject Verification Document
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b91c1c' }}>
                Provide feedback so the worker can upload a compliant replacement
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
              <strong>Worker:</strong> {document.worker?.name || 'Worker'} •{' '}
              <strong>Document:</strong> {document.documentType?.replace(/_/g, ' ')}
            </div>

            <label
              htmlFor="rejectionReason"
              style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}
            >
              Reason for Rejection <span style={{ color: '#ef4444' }}>*</span>
            </label>

            <textarea
              id="rejectionReason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., The uploaded photo is blurry or unreadable, ID name does not match the worker profile, or document has expired."
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: '12.5px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: isSubmitting || !reason.trim() ? '#f87171' : '#dc2626',
                border: 'none',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: isSubmitting || !reason.trim() ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Document'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDocumentRejectModal;
