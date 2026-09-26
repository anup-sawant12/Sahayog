import { useState } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { acceptBooking, rejectBooking, completeBooking } from '../../services/booking.api';

export const BookingActionButtons = ({ bookingId, status, onSuccess }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState(null);

  if (status !== 'PENDING' && status !== 'CONFIRMED') {
    return null;
  }

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      setError(null);
      const res = await acceptBooking(bookingId);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept job request.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsRejecting(true);
      setError(null);
      const res = await rejectBooking(bookingId, {
        cancellationReason: rejectReason.trim() || undefined,
      });
      setShowRejectModal(false);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject job request.');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Are you sure you want to mark this service booking as completed?')) {
      return;
    }

    try {
      setIsCompleting(true);
      setError(null);
      const res = await completeBooking(bookingId);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete job.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div>
      {error && (
        <div style={{ marginBottom: '14px' }}>
          <ErrorMessage message={error} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {status === 'PENDING' && (
          <>
            <Button
              variant="primary"
              size="medium"
              onClick={handleAccept}
              isLoading={isAccepting}
              disabled={isAccepting || isRejecting}
              style={{ background: '#059669', borderColor: '#059669', color: '#ffffff' }}
            >
              {isAccepting ? 'Accepting...' : 'Accept Job'}
            </Button>

            <Button
              variant="outline"
              size="medium"
              onClick={() => setShowRejectModal(true)}
              disabled={isAccepting || isRejecting}
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
            >
              Reject Job
            </Button>
          </>
        )}

        {status === 'CONFIRMED' && (
          <Button
            variant="primary"
            size="medium"
            onClick={handleComplete}
            isLoading={isCompleting}
            disabled={isCompleting}
            style={{ background: '#2563eb', color: '#ffffff' }}
          >
            {isCompleting ? 'Completing...' : 'Mark Completed'}
          </Button>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
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
            if (e.target === e.currentTarget && !isRejecting) {
              setShowRejectModal(false);
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
            <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Reject Job Request
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b' }}>
              Please provide an optional reason for declining this request.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <textarea
                  rows="3"
                  placeholder="e.g. Fully booked at this time, location too distant..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  disabled={isRejecting}
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
                  onClick={() => setShowRejectModal(false)}
                  disabled={isRejecting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="medium"
                  isLoading={isRejecting}
                  disabled={isRejecting}
                  style={{ background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
                >
                  {isRejecting ? 'Rejecting...' : 'Reject Job'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingActionButtons;
