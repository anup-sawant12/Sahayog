import { SkillLevelBadge } from './SkillLevelSelector';
import Button from '../common/Button';

export const SkillCard = ({ workerSkill, onEdit, onRemove }) => {
  const skill = workerSkill?.skill || {};

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '20px 22px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        textAlign: 'left',
      }}
    >
      <div>
        {/* Card Header: Icon, Name & Level Badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#f0fdfa',
                border: '1px solid #ccfbf1',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              ⚡
            </div>
            <h4
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {skill.name || 'Unnamed Skill'}
            </h4>
          </div>

          <SkillLevelBadge level={workerSkill.level} />
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '13px',
            color: '#64748b',
            lineHeight: 1.5,
            margin: '0 0 18px 0',
            minHeight: '38px',
          }}
        >
          {skill.description || 'Verified trade skill offered for cooperative labor dispatch and bookings.'}
        </p>
      </div>

      {/* Card Actions: Edit & Remove */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="small"
          onClick={() => onEdit(workerSkill)}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          onClick={() => onRemove(workerSkill)}
          style={{ color: '#dc2626' }}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          }
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default SkillCard;
