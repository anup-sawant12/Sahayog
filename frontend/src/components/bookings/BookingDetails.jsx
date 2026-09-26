import BookingStatusBadge from './BookingStatusBadge';
import { formatDate, formatTime12h, formatPriceUnit } from './BookingCard';

export const BookingDetails = ({ booking, isWorker = false }) => {
  if (!booking) return null;

  const serviceName =
    booking.workerService?.name ||
    booking.serviceRequest?.serviceName ||
    'Service Booking';

  const category =
    booking.workerService?.category ||
    booking.serviceRequest?.category;

  const priceText = formatPriceUnit(
    booking.price,
    booking.workerService?.pricingUnit
  );

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '28px 32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        textAlign: 'left',
      }}
    >
      {/* Header with Title and Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '20px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Booking Reference #{booking.id.slice(-8).toUpperCase()}
          </span>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '4px 0 2px',
            }}
          >
            {serviceName}
          </h1>
          {category && (
            <span style={{ fontSize: '14px', color: '#2563eb', fontWeight: 500 }}>
              Category: {category}
            </span>
          )}
        </div>

        <BookingStatusBadge status={booking.status} size="large" />
      </div>

      {/* Cancellation / Rejection Notice if applicable */}
      {booking.cancellationReason && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '24px',
            color: '#991b1b',
            fontSize: '14px',
          }}
        >
          <strong style={{ display: 'block', marginBottom: '4px' }}>
            {booking.status === 'REJECTED' ? 'Reason for Rejection:' : 'Reason for Cancellation:'}
          </strong>
          {booking.cancellationReason}
        </div>
      )}

      {/* Grid of Key Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Schedule */}
        <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Schedule & Time
          </span>
          <p style={{ margin: '6px 0 0', fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
            {formatDate(booking.scheduledDate)}
          </p>
          <p style={{ margin: '2px 0 0', color: '#475569', fontSize: '14px' }}>
            at {formatTime12h(booking.scheduledTime)}
          </p>
        </div>

        {/* Pricing */}
        <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Agreed Price
          </span>
          <p style={{ margin: '6px 0 0', fontWeight: 800, color: '#0f172a', fontSize: '18px' }}>
            {priceText || 'Fixed Price'}
          </p>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Standard platform rate
          </span>
        </div>

        {/* Party Contact */}
        <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            {isWorker ? 'Customer Details' : 'Worker Details'}
          </span>
          <p style={{ margin: '6px 0 0', fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
            {isWorker ? booking.customer?.name || 'Customer' : booking.worker?.name || 'Worker'}
          </p>
          <p style={{ margin: '2px 0 0', color: '#475569', fontSize: '13px' }}>
            {isWorker ? booking.customer?.phone : booking.worker?.phone}
          </p>
          <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '13px' }}>
            {isWorker ? booking.customer?.email : booking.worker?.email}
          </p>
        </div>
      </div>

      {/* Location & Service Request Summary */}
      {booking.serviceRequest && (
        <div style={{ marginBottom: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
            Service Location
          </h3>
          <p style={{ margin: 0, fontSize: '14.5px', color: '#334155', fontWeight: 500 }}>
            {booking.serviceRequest.area}, {booking.serviceRequest.city}
            {booking.serviceRequest.pincode ? ` - ${booking.serviceRequest.pincode}` : ''}
          </p>
          {booking.serviceRequest.description && (
            <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              Job description: {booking.serviceRequest.description}
            </p>
          )}
        </div>
      )}

      {/* Customer Notes */}
      {booking.customerNotes && (
        <div style={{ marginBottom: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
            Customer Notes
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
            {booking.customerNotes}
          </p>
        </div>
      )}

      {/* Metadata Timestamps */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#94a3b8',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span>Booked on: {new Date(booking.createdAt).toLocaleString('en-IN')}</span>
        <span>Last updated: {new Date(booking.updatedAt).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

export default BookingDetails;
