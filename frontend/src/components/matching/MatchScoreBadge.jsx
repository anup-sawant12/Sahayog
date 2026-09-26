export const MatchScoreBadge = ({ score, showLabel = true, size = 'medium' }) => {
  const numericScore = Math.round(Number(score) || 0);

  let label = 'Possible Match';
  let color = '#d97706';
  let bgColor = '#fffbeb';
  let borderColor = '#fde68a';

  if (numericScore >= 80) {
    label = 'Excellent Match';
    color = '#059669';
    bgColor = '#ecfdf5';
    borderColor = '#a7f3d0';
  } else if (numericScore >= 60) {
    label = 'Good Match';
    color = '#2563eb';
    bgColor = '#eff6ff';
    borderColor = '#bfdbfe';
  } else if (numericScore >= 40) {
    label = 'Possible Match';
    color = '#d97706';
    bgColor = '#fffbeb';
    borderColor = '#fde68a';
  } else {
    label = 'Low Match';
    color = '#64748b';
    bgColor = '#f8fafc';
    borderColor = '#e2e8f0';
  }

  const isSmall = size === 'small';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '3px 8px' : '5px 12px',
        borderRadius: '9999px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        color: color,
        fontWeight: 600,
        fontSize: isSmall ? '12px' : '13px',
        lineHeight: 1.2,
      }}
      title={`Deterministic rule-based match score: ${numericScore}%`}
    >
      <span style={{ fontSize: isSmall ? '13px' : '15px', fontWeight: 700 }}>{numericScore}%</span>
      {showLabel && (
        <span style={{ opacity: 0.9, fontWeight: 500, fontSize: isSmall ? '11px' : '12px' }}>
          · {label}
        </span>
      )}
    </div>
  );
};

export default MatchScoreBadge;
