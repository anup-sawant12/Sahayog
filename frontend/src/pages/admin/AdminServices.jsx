import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminApi from '../../services/admin.api';
import {
  Wrench,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

export const AdminServices = () => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Skill Modal State (Add or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getSkills();
      if (res.success && Array.isArray(res.data)) {
        setSkills(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load skills.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleOpenAddModal = () => {
    setEditingSkill(null);
    setFormData({ name: '', category: '', description: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      description: skill.description || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Skill name is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitSkill = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setActionSuccess(null);

      if (editingSkill) {
        const res = await adminApi.updateSkill(editingSkill.id, formData);
        if (res.success) {
          setSkills((prev) =>
            prev.map((s) => (s.id === editingSkill.id ? { ...s, ...res.data } : s))
          );
          setActionSuccess(`Skill "${formData.name}" updated successfully.`);
          setModalOpen(false);
        }
      } else {
        const res = await adminApi.createSkill(formData);
        if (res.success) {
          setSkills((prev) => [res.data, ...prev]);
          setActionSuccess(`New skill "${formData.name}" created.`);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (skill) => {
    try {
      const newStatus = !skill.isActive;
      const res = await adminApi.toggleSkillStatus(skill.id, newStatus);
      if (res.success) {
        setSkills((prev) =>
          prev.map((s) => (s.id === skill.id ? { ...s, isActive: newStatus } : s))
        );
        setActionSuccess(`Skill "${skill.name}" is now ${newStatus ? 'Active' : 'Inactive'}.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update skill status.');
    }
  };

  const filteredSkills = skills.filter((s) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = s.name ? s.name.toLowerCase().includes(term) : false;
    const catMatch = s.category ? s.category.toLowerCase().includes(term) : false;
    const descMatch = s.description ? s.description.toLowerCase().includes(term) : false;
    return nameMatch || catMatch || descMatch;
  });

  return (
    <AdminLayout
      title="Platform Skills & Services"
      subtitle="Manage standard skill classifications, occupational categories, and availability"
    >
      {/* Top action bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search skills by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleOpenAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px 0 rgba(37, 99, 235, 0.2)',
            }}
          >
            <Plus size={16} />
            <span>Add New Skill</span>
          </button>

          <button
            type="button"
            onClick={fetchSkills}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Action feedback */}
      {actionSuccess && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '18px',
            color: '#15803d',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          ✓ {actionSuccess}
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '18px',
            color: '#b91c1c',
            fontSize: '13.5px',
          }}
        >
          {error}
        </div>
      )}

      {/* Skills Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Skill Name
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Category
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Description
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Workers Tagged
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td colSpan={6} style={{ padding: '18px 20px' }}>
                      <div style={{ height: '24px', background: '#f8fafc', borderRadius: '6px' }} />
                    </td>
                  </tr>
                ))
              ) : filteredSkills.length > 0 ? (
                filteredSkills.map((sk) => (
                  <tr
                    key={sk.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{sk.name}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                        }}
                      >
                        {sk.category || 'Standard'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569', maxWidth: '320px' }}>
                      {sk.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description</span>}
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                      {sk._count?.workerSkills ?? 0}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {sk.isActive ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: '#dcfce7',
                            color: '#15803d',
                          }}
                        >
                          <CheckCircle size={12} />
                          Active
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: '#f1f5f9',
                            color: '#64748b',
                          }}
                        >
                          <XCircle size={12} />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(sk)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sk)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            background: sk.isActive ? '#fee2e2' : '#dcfce7',
                            border: 'none',
                            color: sk.isActive ? '#b91c1c' : '#15803d',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {sk.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                    <Wrench size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                      No skills found
                    </p>
                    <span style={{ fontSize: '13px' }}>Click "Add New Skill" to register platform skills.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '12.5px', color: '#64748b' }}>
          <span>Total platform skills: {skills.length}</span>
        </div>
      </div>

      {/* Add / Edit Skill Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {editingSkill ? 'Edit Platform Skill' : 'Create New Skill'}
            </h3>

            <form onSubmit={handleSubmitSkill}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Skill Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Residential Wiring, Pipe Fitting"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: formErrors.name ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {formErrors.name && (
                  <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Category *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrical, Plumbing, Carpentry"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: formErrors.category ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {formErrors.category && (
                  <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    {formErrors.category}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the skill competency..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? 'Saving...' : editingSkill ? 'Update Skill' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServices;
