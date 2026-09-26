import SkillCard from './SkillCard';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';

export const WorkerSkillList = ({
  skills = [],
  isLoading = false,
  error = null,
  onRetry,
  onOpenAddModal,
  onEditSkill,
  onRemoveSkill,
}) => {
  if (isLoading) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Loader size="large" color="#0d9488" />
        <p style={{ marginTop: '14px', color: '#64748b', fontSize: '14px' }}>
          Loading your skills...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <ErrorMessage message={error} />
        {onRetry && (
          <Button variant="outline" size="small" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!skills || skills.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1.5px dashed #cbd5e1',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: '#f0fdfa',
            border: '1px solid #ccfbf1',
            color: '#0d9488',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            marginBottom: '16px',
          }}
        >
          🛠️
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
          No skills added yet
        </h3>

        <p
          style={{
            maxWidth: '460px',
            margin: '0 auto 24px auto',
            color: '#64748b',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          Add your trade skills to help customers understand what services you can provide and receive relevant booking dispatches.
        </p>

        <Button
          type="button"
          variant="primary"
          size="medium"
          onClick={onOpenAddModal}
          style={{ background: '#0d9488' }}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Your First Skill
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: '20px',
      }}
    >
      {skills.map((workerSkill) => (
        <SkillCard
          key={workerSkill.id}
          workerSkill={workerSkill}
          onEdit={onEditSkill}
          onRemove={onRemoveSkill}
        />
      ))}
    </div>
  );
};

export default WorkerSkillList;
