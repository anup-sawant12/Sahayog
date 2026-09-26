export const MatchFactors = ({
  serviceMatch = false,
  skillMatch = false,
  availabilityMatch = false,
  locationMatch = false,
  distanceKm = null,
}) => {
  const factors = [
    {
      label: 'Service match',
      matched: Boolean(serviceMatch),
    },
    {
      label: 'Skill match',
      matched: Boolean(skillMatch),
    },
    {
      label: 'Available',
      matched: Boolean(availabilityMatch),
    },
    {
      label: 'Location match',
      matched: Boolean(locationMatch),
      subtext:
        distanceKm !== null && distanceKm !== undefined
          ? `${Number(distanceKm).toFixed(1)} km away`
          : 'Distance unavailable',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px 12px',
        margin: '12px 0',
        padding: '12px 14px',
        background: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #f1f5f9',
      }}
    >
      {factors.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            fontSize: '12.5px',
            lineHeight: 1.3,
            color: item.matched ? '#1e293b' : '#94a3b8',
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: item.matched ? '#059669' : '#94a3b8',
              fontSize: '13px',
              display: 'inline-block',
              width: '12px',
            }}
          >
            {item.matched ? '✓' : '—'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: item.matched ? 600 : 400 }}>{item.label}</span>
            {item.subtext && (
              <span
                style={{
                  fontSize: '11px',
                  color: item.matched ? '#0284c7' : '#94a3b8',
                  marginTop: '1px',
                }}
              >
                {item.subtext}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchFactors;
