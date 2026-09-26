import Button from '../common/Button';
import ServiceStatus from './ServiceStatus';

export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours} hr ${remainingMins} min`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  return `${remainingMins} minutes`;
};

export const formatPriceWithUnit = (price, unit) => {
  const numPrice = Number(price);
  const formatted = isNaN(numPrice) ? price : numPrice.toLocaleString('en-IN');

  switch (unit) {
    case 'HOURLY':
      return `₹${formatted} / hour`;
    case 'DAILY':
      return `₹${formatted} / day`;
    case 'FIXED':
    default:
      return `₹${formatted}`;
  }
};

export const ServiceCard = ({ service, onEdit, onDelete }) => {
  if (!service) return null;

  const durationText = formatDuration(service.durationMinutes);
  const priceText = formatPriceWithUnit(service.price, service.pricingUnit);
  const unitLabel =
    service.pricingUnit === 'HOURLY'
      ? 'Hourly rate'
      : service.pricingUnit === 'DAILY'
      ? 'Daily rate'
      : 'Fixed price';

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 18px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        position: 'relative',
      }}
    >
      <div>
        {/* Top Header Row: Category Badge & Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              background: '#eef2ff',
              color: '#4f46e5',
              border: '1px solid #e0e7ff',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {service.category}
          </span>

          <ServiceStatus status={service.status} />
        </div>

        {/* Service Name */}
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 6px 0',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}
        >
          {service.name}
        </h3>

        {/* Description (if available) */}
        {service.description && (
          <p
            style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              color: '#64748b',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {service.description}
          </p>
        )}

        {/* Price & Duration Box */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '10px 12px',
            margin: service.description ? '0 0 12px 0' : '8px 0 12px 0',
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '10px',
                color: '#94a3b8',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.04em',
                display: 'block',
              }}
            >
              {unitLabel}
            </span>
            <p
              style={{
                margin: '1px 0 0',
                fontSize: '15px',
                color: '#0f172a',
                fontWeight: 800,
                letterSpacing: '-0.01em',
              }}
            >
              {priceText}
            </p>
          </div>

          {durationText && (
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: '10px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  display: 'block',
                }}
              >
                Est. Duration
              </span>
              <p
                style={{
                  margin: '1px 0 0',
                  fontSize: '12px',
                  color: '#475569',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {durationText}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions: Edit & Delete */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '6px',
          paddingTop: '10px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="small"
          onClick={() => onEdit(service)}
          style={{
            height: '28px',
            padding: '0 8px',
            fontSize: '12px',
            gap: '4px',
          }}
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          }
        >
          Edit
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={() => onDelete(service)}
          style={{
            color: '#dc2626',
            height: '28px',
            padding: '0 8px',
            fontSize: '12px',
            gap: '4px',
          }}
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          }
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;
