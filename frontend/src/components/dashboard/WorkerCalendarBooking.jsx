import { useNavigate } from 'react-router-dom';
import BookingStatusBadge from '../bookings/BookingStatusBadge';
import { formatTime12h, formatPriceUnit } from '../bookings/BookingCard';
import Button from '../common/Button';
import {
  Clock3,
  MapPin,
  User,
  BriefcaseBusiness,
  ArrowRight,
} from 'lucide-react';

export const WorkerCalendarBooking = ({ booking }) => {
  const navigate = useNavigate();

  if (!booking) return null;

  const serviceName =
    booking.workerService?.name ||
    booking.serviceRequest?.serviceName ||
    'Service Job';

  const customerName = booking.customer?.name || 'Customer';
  const timeFormatted = formatTime12h(booking.scheduledTime);
  const priceFormatted = formatPriceUnit(booking.price, booking.workerService?.pricingUnit);

  const isPending = booking.status === 'PENDING';

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: isPending ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
        padding: '16px 18px',
        boxShadow: isPending
          ? '0 2px 6px rgba(245, 158, 11, 0.08)'
          : '0 1px 3px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Header: Service Name + Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div>
          <h4
            style={{
              margin: '0 0 4px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BriefcaseBusiness size={15} color="#0d9488" />
            {serviceName}
          </h4>
          <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={13} color="#94a3b8" />
            Customer: <strong style={{ color: '#334155' }}>{customerName}</strong>
          </div>
        </div>

        <BookingStatusBadge status={booking.status} size="small" />
      </div>

      {/* Meta Details: Time, Price, Location */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          fontSize: '13px',
          color: '#475569',
          paddingTop: '4px',
          borderTop: '1px dashed #f1f5f9',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Clock3 size={14} color="#0284c7" />
          <span>{timeFormatted}</span>
        </div>

        <div style={{ fontWeight: 700, color: '#0f172a' }}>
          {priceFormatted}
        </div>

        {booking.serviceRequest && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
            <MapPin size={13} color="#94a3b8" />
            <span>{booking.serviceRequest.area || booking.serviceRequest.city}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
        <Button
          variant={isPending ? 'primary' : 'outline'}
          size="small"
          onClick={() => navigate(`/worker/bookings/${booking.id}`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            ...(isPending ? { background: '#d97706', borderColor: '#d97706' } : {}),
          }}
        >
          {isPending ? 'Review & Accept' : 'View Booking'}
          <ArrowRight size={13} />
        </Button>
      </div>
    </div>
  );
};

export default WorkerCalendarBooking;
