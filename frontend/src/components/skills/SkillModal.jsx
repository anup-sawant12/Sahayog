import { useState } from 'react';
import skillApi from '../../services/skill.api';
import SkillLevelSelector from './SkillLevelSelector';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

export const ModalBackdrop = ({ children, onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          animation: 'slideUp 0.25s ease-out',
          overflow: 'hidden',
          textAlign: 'left',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const EditSkillModal = ({ workerSkill, onSuccess, onClose }) => {
  const [level, setLevel] = useState(workerSkill?.level || 'INTERMEDIATE');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skillName = workerSkill?.skill?.name || 'Skill';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (level === workerSkill.level) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await skillApi.updateSkill(workerSkill.id, { level });
      if (res.success && res.data?.skill) {
        onSuccess(res.data.skill);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403 ? 'Access denied. You can only edit your own skills.' : null) ||
        'Failed to update skill proficiency level.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Edit Skill Proficiency
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Update your trade level for <strong style={{ color: '#0f766e' }}>{skillName}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit} noValidate>
          <SkillLevelSelector
            value={level}
            onChange={setLevel}
            disabled={isSubmitting}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="medium"
              isLoading={isSubmitting}
              style={{ background: '#0d9488' }}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};

export const RemoveSkillModal = ({ workerSkill, onConfirm, onClose, isSubmitting = false }) => {
  const skillName = workerSkill?.skill?.name || 'this skill';

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{ padding: '28px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
          Remove this skill?
        </h3>

        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          Are you sure you want to remove <strong style={{ color: '#0f172a' }}>{skillName}</strong> from your profile? Customers will no longer see this skill on your worker card.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={() => onConfirm(workerSkill.id)}
            isLoading={isSubmitting}
            style={{ background: '#dc2626', borderColor: '#b91c1c' }}
          >
            Remove Skill
          </Button>
        </div>
      </div>
    </ModalBackdrop>
  );
};
