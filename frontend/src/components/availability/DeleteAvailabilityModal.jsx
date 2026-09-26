import Button from '../common/Button';
import { formatTime12h } from './AvailabilityCard';

const DAY_LABELS = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

export const DeleteAvailabilityModal = ({
  slot,
  onConfirm,
  onClose,
  isSubmitting = false,
}) => {
  const dayName = DAY_LABELS[slot?.dayOfWeek] || slot?.dayOfWeek || 'this day';
  const timeRange = slot ? `${formatTime12h(slot.startTime)} – ${formatTime12h(slot.endTime)}` : '';

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
        if (e.target === e.currentTarget && onClose && !isSubmitting) {
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

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Delete availability?
        </h3>

        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 18px 0' }}>
          This time slot ({dayName}{timeRange ? ` from ${timeRange}` : ''}) will be removed from your weekly schedule.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={() => onConfirm(slot.id)}
            isLoading={isSubmitting}
            style={{ background: '#dc2626' }}
          >
            Delete Slot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAvailabilityModal;
