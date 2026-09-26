import BookingCard from './BookingCard';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';

export const BookingList = ({
  bookings = [],
  isLoading = false,
  error = null,
  isWorker = false,
  emptyTitle = 'No bookings found',
  emptyMessage = 'There are no service bookings to display.',
  emptyAction = null,
  onViewDetails,
}) => {
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}
      >
        <Loader size="large" />
        <p style={{ marginTop: '16px', fontSize: '15px', color: '#1e40af', fontWeight: 600 }}>
          Loading Bookings...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ margin: '20px 0' }}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '50px 24px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#64748b',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
          {emptyTitle}
        </h3>
        <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
          {emptyMessage}
        </p>

        {emptyAction}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}
    >
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          isWorker={isWorker}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default BookingList;
