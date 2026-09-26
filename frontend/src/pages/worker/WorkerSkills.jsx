import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import skillApi from '../../services/skill.api';
import WorkerSkillList from '../../components/skills/WorkerSkillList';
import AddSkillForm from '../../components/skills/AddSkillForm';
import { ModalBackdrop, EditSkillModal, RemoveSkillModal } from '../../components/skills/SkillModal';
import Button from '../../components/common/Button';

export const WorkerSkills = () => {
  const [workerSkills, setWorkerSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch worker's assigned skills
  const fetchWorkerSkills = useCallback(async () => {
    setIsLoadingSkills(true);
    setError('');

    try {
      const res = await skillApi.getMySkills();
      if (res.success && Array.isArray(res.data?.skills)) {
        setWorkerSkills(res.data.skills);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 404
          ? 'Worker profile not found. Please complete your worker profile first.'
          : null) ||
        'Unable to load your skills. Please check your network connection.';
      setError(msg);
    } finally {
      setIsLoadingSkills(false);
    }
  }, []);

  // Fetch public skill catalog for selection
  const fetchCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    try {
      const res = await skillApi.getSkills();
      if (res.success && Array.isArray(res.data?.skills)) {
        setAvailableSkills(res.data.skills);
      }
    } catch (err) {
      console.error('Failed to load skill catalog:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkerSkills();
    fetchCatalog();
  }, [fetchWorkerSkills, fetchCatalog]);

  // List of assigned skill IDs to avoid duplicate selection
  const assignedSkillIds = useMemo(() => {
    return workerSkills.map((ws) => ws.skill?.id || ws.skillId).filter(Boolean);
  }, [workerSkills]);

  const showSuccess = (message) => {
    setSuccessBanner(message);
    setTimeout(() => {
      setSuccessBanner('');
    }, 4000);
  };

  const handleAddSuccess = (newWorkerSkill) => {
    setWorkerSkills((prev) => [newWorkerSkill, ...prev]);
    setIsAddModalOpen(false);
    showSuccess(`Skill "${newWorkerSkill.skill?.name}" successfully added to your profile.`);
  };

  const handleUpdateSuccess = (updatedWorkerSkill) => {
    setWorkerSkills((prev) =>
      prev.map((ws) => (ws.id === updatedWorkerSkill.id ? updatedWorkerSkill : ws))
    );
    setEditingSkill(null);
    showSuccess(`Proficiency level for "${updatedWorkerSkill.skill?.name}" updated.`);
  };

  const handleRemoveConfirm = async (workerSkillId) => {
    setIsDeleting(true);
    try {
      const res = await skillApi.removeSkill(workerSkillId);
      if (res.success) {
        setWorkerSkills((prev) => prev.filter((ws) => ws.id !== workerSkillId));
        setDeletingSkill(null);
        showSuccess('Skill removed from your profile.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove skill. Please try again.';
      setError(msg);
      setDeletingSkill(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb / Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <Link
            to="/worker/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0d9488',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f0fdfa',
              transition: 'background 0.15s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Worker Services & Trades
          </span>
        </div>

        {/* Page Header with Action Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '16px',
            textAlign: 'left',
          }}
        >
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              My Skills
            </h1>
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
              Manage the trade skills you offer to customers and receive relevant bookings.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={() => setIsAddModalOpen(true)}
            style={{ background: '#0d9488' }}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Add Skill
          </Button>
        </div>

        {/* Success Alert Banner */}
        {successBanner && (
          <div
            className="success-banner"
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '24px',
              animation: 'fadeIn 0.25s ease-out',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ flex: 1 }}>{successBanner}</span>
            <button
              type="button"
              onClick={() => setSuccessBanner('')}
              aria-label="Dismiss banner"
              style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: 0 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Skills Section Header */}
        <div style={{ textAlign: 'left', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Your Skills {!isLoadingSkills && `(${workerSkills.length})`}
          </h2>
        </div>

        {/* Worker Skills List */}
        <WorkerSkillList
          skills={workerSkills}
          isLoading={isLoadingSkills}
          error={error}
          onRetry={fetchWorkerSkills}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onEditSkill={(skill) => setEditingSkill(skill)}
          onRemoveSkill={(skill) => setDeletingSkill(skill)}
        />

        {/* ADD SKILL MODAL */}
        {isAddModalOpen && (
          <ModalBackdrop onClose={() => setIsAddModalOpen(false)}>
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Add Trade Skill
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Select a skill from the marketplace catalog and set your proficiency
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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

              <AddSkillForm
                availableSkills={availableSkills}
                assignedSkillIds={assignedSkillIds}
                isLoadingCatalog={isLoadingCatalog}
                onSuccess={handleAddSuccess}
                onCancel={() => setIsAddModalOpen(false)}
              />
            </div>
          </ModalBackdrop>
        )}

        {/* EDIT SKILL MODAL */}
        {editingSkill && (
          <EditSkillModal
            workerSkill={editingSkill}
            onSuccess={handleUpdateSuccess}
            onClose={() => setEditingSkill(null)}
          />
        )}

        {/* REMOVE SKILL CONFIRMATION DIALOG */}
        {deletingSkill && (
          <RemoveSkillModal
            workerSkill={deletingSkill}
            isSubmitting={isDeleting}
            onConfirm={handleRemoveConfirm}
            onClose={() => setDeletingSkill(null)}
          />
        )}
      </div>
    </div>
  );
};

export default WorkerSkills;
