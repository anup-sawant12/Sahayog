import Button from '../common/Button';

export const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  if (isNaN(hours)) return time24;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const AvailabilityCard = ({ slot, onEdit, onDelete }) => {
  const isAvailable = slot.isAvailable !== false;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 12px',
        borderRadius: '8px',
        background: isAvailable ? '#ffffff' : '#f8fafc',
        border: '1px solid #e2e8f0',
        boxShadow: isAvailable ? '0 1px 2px rgba(0, 0, 0, 0.03)' : 'none',
        transition: 'all 0.15s ease',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      {/* Time Range & Visual Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#0f172a',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span>{formatTime12h(slot.startTime)}</span>
          <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '12px' }}>–</span>
          <span>{formatTime12h(slot.endTime)}</span>
        </div>

        {/* Status Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 7px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            background: isAvailable ? '#ecfdf5' : '#f1f5f9',
            color: isAvailable ? '#065f46' : '#64748b',
            border: `1px solid ${isAvailable ? '#a7f3d0' : '#e2e8f0'}`,
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: isAvailable ? '#10b981' : '#94a3b8',
            }}
          />
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={() => onEdit(slot)}
          aria-label="Edit time slot"
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
          onClick={() => onDelete(slot)}
          aria-label="Delete time slot"
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

export default AvailabilityCard;
