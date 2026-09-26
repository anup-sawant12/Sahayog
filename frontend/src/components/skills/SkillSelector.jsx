import { useState, useMemo } from 'react';
import Loader from '../common/Loader';

export const SkillSelector = ({
  availableSkills = [],
  assignedSkillIds = [],
  selectedSkillId,
  onSelectSkill,
  searchTerm: externalSearchTerm,
  onSearchTermChange,
  isLoading = false,
  disabled = false,
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = onSearchTermChange || setInternalSearchTerm;

  // Filter out skills that the worker already has
  const unassignedSkills = useMemo(() => {
    const assignedSet = new Set(assignedSkillIds);
    return availableSkills.filter((s) => !assignedSet.has(s.id));
  }, [availableSkills, assignedSkillIds]);

  // Client-side search filtering by name or description
  const filteredSkills = useMemo(() => {
    if (!searchTerm.trim()) return unassignedSkills;
    const term = searchTerm.toLowerCase().trim();
    return unassignedSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
    );
  }, [unassignedSkills, searchTerm]);

  // Find currently selected skill object
  const selectedSkill = useMemo(() => {
    return availableSkills.find((s) => s.id === selectedSkillId);
  }, [availableSkills, selectedSkillId]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    // If user types exact match of an unassigned skill, auto-select it
    if (val.trim()) {
      const exactMatch = unassignedSkills.find(
        (s) => s.name.toLowerCase() === val.trim().toLowerCase()
      );
      if (exactMatch) {
        onSelectSkill(exactMatch.id);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSkills.length > 0) {
        onSelectSkill(filteredSkills[0].id);
        setSearchTerm(filteredSkills[0].name);
      }
    }
  };

  const handleSelect = (skill) => {
    if (disabled) return;
    onSelectSkill(skill.id);
    setSearchTerm(skill.name);
  };

  return (
    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1e293b',
            margin: 0,
          }}
        >
          Select Skill <span style={{ color: '#ef4444' }}>*</span>
        </label>

        {selectedSkill && (
          <span
            style={{
              fontSize: '12px',
              color: '#0d9488',
              fontWeight: 600,
              background: '#f0fdfa',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #ccfbf1',
            }}
          >
            Selected: {selectedSkill.name} ✓
          </span>
        )}
      </div>

      {/* Search / Type Input */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px',
          border: selectedSkill ? '1.5px solid #0d9488' : '1.5px solid #cbd5e1',
          background: '#ffffff',
          marginBottom: '10px',
          transition: 'border-color 0.15s ease',
        }}
      >
        <div style={{ paddingLeft: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Type or search skills (e.g. Electrician, Plumbing)..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          style={{
            width: '100%',
            height: '42px',
            padding: '0 12px',
            fontSize: '14px',
            border: 'none',
            background: 'transparent',
            outline: 'none',
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              onSelectSkill('');
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Skills Picker List Box */}
      <div
        style={{
          maxHeight: '220px',
          overflowY: 'auto',
          border: '1.5px solid #e2e8f0',
          borderRadius: '10px',
          background: '#ffffff',
          padding: '6px',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
            <Loader size="medium" color="#0d9488" />
            <p style={{ margin: '8px 0 0', fontSize: '13px' }}>Loading available catalog...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
              {availableSkills.length === 0
                ? 'No skills available in the marketplace catalog.'
                : unassignedSkills.length === 0
                ? 'All available skills have already been added to your profile!'
                : `No skills found matching "${searchTerm}"`}
            </p>
          </div>
        ) : (
          filteredSkills.map((skill) => {
            const isSelected = selectedSkillId === skill.id;

            return (
              <div
                key={skill.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(skill)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(skill);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  background: isSelected ? '#f0fdfa' : '#ffffff',
                  border: isSelected ? '1px solid #99f6e4' : '1px solid transparent',
                  transition: 'background 0.15s ease',
                  marginBottom: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: isSelected ? '#ccfbf1' : '#f1f5f9',
                      color: isSelected ? '#0d9488' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    ⚡
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      {skill.name}
                    </div>
                    {skill.description && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {skill.description}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid #0d9488' : '2px solid #cbd5e1',
                    background: isSelected ? '#0d9488' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SkillSelector;
