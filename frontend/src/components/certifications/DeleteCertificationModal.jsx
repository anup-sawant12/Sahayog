import Button from '../common/Button';

export const DeleteCertificationModal = ({
  certification,
  onConfirm,
  onClose,
  isSubmitting = false,
}) => {
  const certName = certification?.name || 'this certification';

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          padding: '28px',
          textAlign: 'left',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
          Delete certification?
        </h3>

        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          Are you sure you want to delete <strong style={{ color: '#0f172a' }}>{certName}</strong>? This certification will be permanently removed from your profile.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={() => onConfirm(certification.id)}
            isLoading={isSubmitting}
            style={{ background: '#dc2626', borderColor: '#b91c1c' }}
          >
            Delete Certification
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCertificationModal;
