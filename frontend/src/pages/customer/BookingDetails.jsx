import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomerBooking } from '../../services/booking.api';
import BookingDetailsView from '../../components/bookings/BookingDetails';
import CancelBookingModal from '../../components/bookings/CancelBookingModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';

export const CustomerBookingDetails = () => {
  const { id: bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getCustomerBooking(bookingId);
      setBooking(res.data);
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Booking not found.'
          : err.response?.data?.message || 'Failed to load booking details.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleCancellationSuccess = (updatedBooking) => {
    setBooking(updatedBooking);
    setShowCancelModal(false);
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 860, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <Loader size="large" />
        <p style={{ marginTop: '16px', color: '#1e40af', fontWeight: 600 }}>
          Loading booking details...
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ maxWidth: 860, margin: '50px auto', padding: '0 24px', textAlign: 'left' }}>
        <ErrorMessage message={error || 'Booking could not be loaded.'} />
        <div style={{ marginTop: '20px' }}>
          <Link to="/customer/bookings" style={{ color: '#2563eb', fontWeight: 600 }}>
            &larr; Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

  return (
    <div style={{ maxWidth: 880, margin: '40px auto', padding: '0 24px', textAlign: 'left' }}>
      {/* Top Header & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Link
          to="/customer/bookings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to My Bookings
        </Link>

        {canCancel && (
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowCancelModal(true)}
            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
          >
            Cancel Booking
          </Button>
        )}
      </div>

      {/* Main Details View */}
      <BookingDetailsView booking={booking} isWorker={false} />

      {/* Cancellation Modal */}
      {showCancelModal && (
        <CancelBookingModal
          bookingId={booking.id}
          status={booking.status}
          onSuccess={handleCancellationSuccess}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
};

export default CustomerBookingDetails;
