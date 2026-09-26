import AvailabilityCard from './AvailabilityCard';
import Button from '../common/Button';

export const AvailabilityDay = ({
  dayKey,
  dayLabel,
  slots = [],
  onAddSlotForDay,
  onEditSlot,
  onDeleteSlot,
}) => {
  const hasSlots = slots.length > 0;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '12px 16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
        textAlign: 'left',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Day Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: hasSlots ? '10px' : '6px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: hasSlots ? '#f0fdfa' : '#f8fafc',
              border: `1px solid ${hasSlots ? '#ccfbf1' : '#e2e8f0'}`,
              color: hasSlots ? '#0d9488' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {dayLabel.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: hasSlots ? '#0f172a' : '#64748b',
                margin: 0,
              }}
            >
              {dayLabel}
            </h3>
            {hasSlots && (
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {slots.length} time slot{slots.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>

        {/* Add Hours Action */}
        <Button
          type="button"
          variant="outline"
          size="small"
          onClick={() => onAddSlotForDay(dayKey)}
          style={{
            height: '28px',
            padding: '0 9px',
            fontSize: '12px',
            gap: '4px',
            borderColor: '#ccfbf1',
            color: '#0d9488',
            background: '#f0fdfa',
          }}
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Hours
        </Button>
      </div>

      {/* Slots List or Empty State */}
      {hasSlots ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {slots.map((slot) => (
            <AvailabilityCard
              key={slot.id}
              slot={slot}
              onEdit={onEditSlot}
              onDelete={onDeleteSlot}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
            No availability set
          </p>

          <button
            type="button"
            onClick={() => onAddSlotForDay(dayKey)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0d9488',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            + Add Hours
          </button>
        </div>
      )}
    </div>
  );
};

export default AvailabilityDay;
