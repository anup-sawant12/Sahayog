import { useState } from 'react';
import skillApi from '../../services/skill.api';
import SkillSelector from './SkillSelector';
import SkillLevelSelector from './SkillLevelSelector';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

export const AddSkillForm = ({
  availableSkills = [],
  assignedSkillIds = [],
  isLoadingCatalog = false,
  onSuccess,
  onCancel,
}) => {
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [level, setLevel] = useState('INTERMEDIATE');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let skillIdToSubmit = selectedSkillId;

    // If user typed a skill name directly without clicking a row
    if (!skillIdToSubmit) {
      const typed = searchTerm.trim().toLowerCase();
      if (typed) {
        const assignedSet = new Set(assignedSkillIds);
        const unassigned = availableSkills.filter((s) => !assignedSet.has(s.id));

        // 1. Try exact name match
        let match = unassigned.find((s) => s.name.toLowerCase() === typed);

        // 2. Try prefix / substring match
        if (!match) {
          match = unassigned.find((s) => s.name.toLowerCase().includes(typed));
        }

        if (match) {
          skillIdToSubmit = match.id;
          setSelectedSkillId(match.id);
        } else {
          setError(`No skill found matching "${searchTerm.trim()}". Please select a skill from the list below.`);
          return;
        }
      } else {
        setError('Please select or type a skill to add.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await skillApi.addSkill({
        skillId: skillIdToSubmit,
        level,
      });

      if (res.success && res.data?.skill) {
        onSuccess(res.data.skill);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'Skill already added to your profile'
          : null) ||
        (err.response?.status === 404 ? 'Skill or worker profile not found' : null) ||
        'Failed to add skill. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Select Skill */}
      <SkillSelector
        availableSkills={availableSkills}
        assignedSkillIds={assignedSkillIds}
        selectedSkillId={selectedSkillId}
        onSelectSkill={(id) => {
          setSelectedSkillId(id);
          if (error) setError('');
        }}
        searchTerm={searchTerm}
        onSearchTermChange={(val) => {
          setSearchTerm(val);
          if (error) setError('');
        }}
        isLoading={isLoadingCatalog}
        disabled={isSubmitting}
      />

      {/* Select Level */}
      <SkillLevelSelector
        value={level}
        onChange={setLevel}
        disabled={isSubmitting}
      />

      {/* Action Buttons */}
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
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="medium"
          isLoading={isSubmitting}
          style={{ background: '#0d9488', color: '#ffffff', borderColor: 'transparent' }}
        >
          Add Skill
        </Button>
      </div>
    </form>
  );
};

export default AddSkillForm;
