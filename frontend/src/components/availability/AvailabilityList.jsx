import AvailabilityDay from './AvailabilityDay';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';

const DAYS_CONFIG = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' },
];

export const AvailabilityList = ({
  availability = [],
  isLoading = false,
  error = '',
  onRetry,
  onOpenAddModal,
  onAddSlotForDay,
  onEditSlot,
  onDeleteSlot,
}) => {
  if (isLoading) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '48px 20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Loader size="medium" color="#0d9488" />
        <p style={{ marginTop: '12px', color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
          Loading your weekly schedule...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '32px 20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <ErrorMessage message={error} />
        {onRetry && (
          <div style={{ marginTop: '14px' }}>
            <Button variant="outline" size="small" onClick={onRetry}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Group slots by day
  const slotsByDay = DAYS_CONFIG.reduce((acc, day) => {
    acc[day.key] = availability
      .filter((s) => s.dayOfWeek === day.key)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const hasAnySlots = availability.length > 0;

  return (
    <div>
      {!hasAnySlots && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1.5px dashed #cbd5e1',
            padding: '36px 20px',
            textAlign: 'center',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#f0fdfa',
              border: '1px solid #ccfbf1',
              color: '#0d9488',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            No availability set
          </h3>

          <p style={{ maxWidth: '400px', margin: '0 auto 18px', color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
            Add your working hours so customers and cooperatives know when you are available to accept service bookings.
          </p>

          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={onOpenAddModal}
            style={{ background: '#0d9488' }}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Add Availability
          </Button>
        </div>
      )}

      {/* 7-Day Weekly Grid / Schedule */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {DAYS_CONFIG.map((day) => (
          <AvailabilityDay
            key={day.key}
            dayKey={day.key}
            dayLabel={day.label}
            slots={slotsByDay[day.key] || []}
            onAddSlotForDay={onAddSlotForDay}
            onEditSlot={onEditSlot}
            onDeleteSlot={onDeleteSlot}
          />
        ))}
      </div>
    </div>
  );
};

export default AvailabilityList;
