import Button from '../common/Button';

/**
 * DeleteServiceAreaModal component
 * Confirmation dialog for removing a worker's service area.
 * Uses vanilla CSS and Button component (no Tailwind).
 */
export default function DeleteServiceAreaModal({
  isOpen = true,
  onClose,
  onConfirm,
  serviceArea = null,
  isLoading = false,
  isSubmitting = false
}) {
  if (!isOpen || !serviceArea) return null;
  const submitting = isLoading || isSubmitting;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose && !submitting) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          padding: '20px',
          textAlign: 'left',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {/* Warning Icon */}
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>

        {/* Title & Message */}
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Delete service area?
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
          This location will be removed from your service coverage.
        </p>

        {/* Target summary badge */}
        <div
          style={{
            padding: '6px 10px',
            background: '#f8fafc',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#334155',
            border: '1px solid #e2e8f0',
            marginBottom: '18px',
            display: 'inline-block',
          }}
        >
          {serviceArea.area}, {serviceArea.city} ({serviceArea.pincode})
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={onConfirm}
            isLoading={submitting}
            style={{ background: '#dc2626' }}
          >
            Delete Service Area
          </Button>
        </div>
      </div>
    </div>
  );
}
