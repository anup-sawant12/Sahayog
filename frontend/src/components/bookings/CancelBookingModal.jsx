import { useState } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { cancelBooking } from '../../services/booking.api';

export const CancelBookingModal = ({ bookingId, status, onSuccess, onClose }) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (status !== 'PENDING' && status !== 'CONFIRMED') {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const res = await cancelBooking(bookingId, {
        cancellationReason: cancellationReason.trim() || undefined,
      });

      if (onSuccess) {
        onSuccess(res.data);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to cancel this booking. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e2e8f0',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            Cancel Booking
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '20px',
              padding: '4px',
            }}
          >
            &times;
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: '16px' }}>
            <ErrorMessage message={error} />
          </div>
        )}

        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="cancellationReason"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '6px',
              }}
            >
              Reason for Cancellation <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              id="cancellationReason"
              rows="3"
              placeholder="e.g. Schedule conflict, no longer needed, found another arrangement..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                fontFamily: 'inherit',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Keep Booking
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="medium"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              style={{ background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
            >
              {isSubmitting ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelBookingModal;
