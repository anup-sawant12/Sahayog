export const SKILL_LEVELS = [
  {
    key: 'BEGINNER',
    label: 'Beginner',
    description: 'Basic knowledge, learning or supervised tasks',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    textColor: '#1d4ed8',
    dotColor: '#3b82f6',
  },
  {
    key: 'INTERMEDIATE',
    label: 'Intermediate',
    description: 'Independent on standard service jobs',
    badgeBg: '#f0fdfa',
    badgeBorder: '#99f6e4',
    textColor: '#0f766e',
    dotColor: '#0d9488',
  },
  {
    key: 'ADVANCED',
    label: 'Advanced',
    description: 'Highly skilled, handles complex situations',
    badgeBg: '#eef2ff',
    badgeBorder: '#c7d2fe',
    textColor: '#4338ca',
    dotColor: '#6366f1',
  },
  {
    key: 'EXPERT',
    label: 'Expert',
    description: 'Master craftsman / certified specialist',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    textColor: '#166534',
    dotColor: '#16a34a',
  },
];

export const SkillLevelBadge = ({ level }) => {
  const current = SKILL_LEVELS.find((lvl) => lvl.key === level) || SKILL_LEVELS[0];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 700,
        background: current.badgeBg,
        color: current.textColor,
        border: `1px solid ${current.badgeBorder}`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: current.dotColor,
        }}
      ></span>
      {current.label}
    </span>
  );
};

export const SkillLevelSelector = ({ value, onChange, disabled = false }) => {
  return (
    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
      <label
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: '#1e293b',
          marginBottom: '8px',
        }}
      >
        Proficiency Level <span style={{ color: '#ef4444' }}>*</span>
      </label>

      <div
        role="radiogroup"
        aria-label="Skill Proficiency Level"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
        }}
      >
        {SKILL_LEVELS.map((lvl) => {
          const isSelected = value === lvl.key;

          return (
            <button
              key={lvl.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(lvl.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px 12px',
                borderRadius: '10px',
                border: isSelected
                  ? `2px solid ${lvl.dotColor}`
                  : '1.5px solid #e2e8f0',
                background: isSelected ? lvl.badgeBg : '#ffffff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                outline: 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isSelected ? lvl.textColor : '#334155',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: lvl.dotColor,
                  }}
                ></span>
                {lvl.label}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginTop: '4px',
                  lineHeight: 1.3,
                }}
              >
                {lvl.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SkillLevelSelector;
