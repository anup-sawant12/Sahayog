import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWorkerBooking } from '../../services/booking.api';
import BookingDetailsView from '../../components/bookings/BookingDetails';
import BookingActionButtons from '../../components/bookings/BookingActionButtons';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';

export const JobRequestDetails = () => {
  const { id: bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getWorkerBooking(bookingId);
      setBooking(res.data);
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Job request not found.'
          : err.response?.data?.message || 'Failed to load job request details.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleActionSuccess = (updatedBooking) => {
    if (updatedBooking) {
      setBooking(updatedBooking);
    } else {
      fetchBooking();
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 860, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <Loader size="large" />
        <p style={{ marginTop: '16px', color: '#0d9488', fontWeight: 600 }}>
          Loading job request details...
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ maxWidth: 860, margin: '50px auto', padding: '0 24px', textAlign: 'left' }}>
        <ErrorMessage message={error || 'Job request could not be loaded.'} />
        <div style={{ marginTop: '20px' }}>
          <Link to="/worker/bookings" style={{ color: '#0d9488', fontWeight: 600 }}>
            &larr; Back to Job Requests
          </Link>
        </div>
      </div>
    );
  }

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
          gap: '14px',
        }}
      >
        <Link
          to="/worker/bookings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#0d9488',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Job Requests
        </Link>

        {/* Action Buttons for Worker */}
        <BookingActionButtons
          bookingId={booking.id}
          status={booking.status}
          onSuccess={handleActionSuccess}
        />
      </div>

      {/* Main Details View */}
      <BookingDetailsView booking={booking} isWorker={true} />
    </div>
  );
};

export default JobRequestDetails;
