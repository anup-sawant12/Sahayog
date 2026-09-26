import Button from '../common/Button';

export const ServiceAreaCard = ({ area, serviceArea, onEdit, onDelete }) => {
  const currentArea = area || serviceArea || {};
  const isPrimary = Boolean(currentArea.isPrimary);
  const hasCoordinates =
    currentArea.latitude !== null &&
    currentArea.latitude !== undefined &&
    currentArea.longitude !== null &&
    currentArea.longitude !== undefined;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: `1.5px solid ${isPrimary ? '#0d9488' : '#e2e8f0'}`,
        padding: '16px 18px',
        boxShadow: isPrimary
          ? '0 2px 8px -1px rgba(13, 148, 136, 0.12)'
          : '0 1px 2px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        position: 'relative',
      }}
    >
      <div>
        {/* Top Header Row: Location Icon, City & Primary Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isPrimary ? '#f0fdfa' : '#f8fafc',
                border: `1px solid ${isPrimary ? '#ccfbf1' : '#e2e8f0'}`,
                color: isPrimary ? '#0d9488' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {currentArea.city}
              </h3>
              <p
                style={{
                  margin: '1px 0 0',
                  fontSize: '12px',
                  color: '#475569',
                  fontWeight: 500,
                }}
              >
                {currentArea.area}
              </p>
            </div>
          </div>

          {isPrimary && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                background: '#f0fdfa',
                color: '#0f766e',
                border: '1px solid #99f6e4',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Primary Service Area
            </span>
          )}
        </div>

        {/* Location Specs: Pincode, Radius, Coordinates */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '10px 12px',
            margin: '10px 0',
            border: '1px solid #f1f5f9',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '8px',
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Pincode
            </span>
            <p style={{ margin: '1px 0 0', fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>
              {currentArea.pincode}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Service Radius
            </span>
            <p style={{ margin: '1px 0 0', fontSize: '13px', color: '#0d9488', fontWeight: 700 }}>
              {currentArea.serviceRadiusKm || 10} km
            </p>
          </div>

          {hasCoordinates && (
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Location
              </span>
              <p
                style={{
                  margin: '1px 0 0',
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Coordinates available
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
          onClick={() => onEdit(currentArea)}
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
          onClick={() => onDelete(currentArea)}
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

export default ServiceAreaCard;
