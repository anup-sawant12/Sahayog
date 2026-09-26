import { useNavigate } from 'react-router-dom';
import BookingStatusBadge from './BookingStatusBadge';
import Button from '../common/Button';

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatTime12h = (timeStr) => {
  if (!timeStr) return 'N/A';
  try {
    const [hStr, mStr] = timeStr.split(':');
    const hour = parseInt(hStr, 10);
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${mStr} ${ampm}`;
  } catch {
    return timeStr;
  }
};

export const formatPriceUnit = (price, unit) => {
  if (price === null || price === undefined) return '';
  const numPrice = Number(price);
  const formatted = isNaN(numPrice) ? price : numPrice.toLocaleString('en-IN');

  switch (unit) {
    case 'HOURLY':
      return `₹${formatted} / hr`;
    case 'DAILY':
      return `₹${formatted} / day`;
    case 'FIXED':
    default:
      return `₹${formatted} · Fixed`;
  }
};

export const BookingCard = ({ booking, isWorker = false, onViewDetails }) => {
  const navigate = useNavigate();

  if (!booking) return null;

  const serviceName =
    booking.workerService?.name ||
    booking.serviceRequest?.serviceName ||
    'Service Booking';

  const otherPartyName = isWorker
    ? booking.customer?.name || 'Customer'
    : booking.worker?.name || 'Assigned Worker';

  const priceFormatted = formatPriceUnit(
    booking.price,
    booking.workerService?.pricingUnit
  );

  const locationText = booking.serviceRequest
    ? `${booking.serviceRequest.area}, ${booking.serviceRequest.city}`
    : null;

  const handleView = () => {
    if (onViewDetails) {
      onViewDetails(booking);
    } else {
      const destination = isWorker
        ? `/worker/bookings/${booking.id}`
        : `/customer/bookings/${booking.id}`;
      navigate(destination);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '20px 22px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left',
        transition: 'all 0.2s ease',
      }}
    >
      <div>
        {/* Header: Service name & Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '8px',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 2px',
              }}
            >
              {serviceName}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0,
                fontWeight: 500,
              }}
            >
              {isWorker ? 'Requested by: ' : 'Worker: '}
              <strong style={{ color: '#1e293b' }}>{otherPartyName}</strong>
            </p>
          </div>

          <BookingStatusBadge status={booking.status} size="small" />
        </div>

        {/* Price & Schedule Info */}
        <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {priceFormatted && (
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              {priceFormatted}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13.5px',
              color: '#334155',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDate(booking.scheduledDate)}
            </span>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatTime12h(booking.scheduledTime)}
            </span>
          </div>

          {locationText && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                color: '#64748b',
                marginTop: '2px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {locationText}
            </div>
          )}
        </div>
      </div>

      {/* CTA Footer */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '14px',
          marginTop: '6px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="outline"
          size="small"
          onClick={handleView}
        >
          {isWorker ? 'View Request' : 'View Details'}
        </Button>
      </div>
    </div>
  );
};

export default BookingCard;
