import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import certificationApi from '../../services/certification.api';
import CertificationList from '../../components/certifications/CertificationList';
import CertificationForm from '../../components/certifications/CertificationForm';
import DeleteCertificationModal from '../../components/certifications/DeleteCertificationModal';
import Button from '../../components/common/Button';

export const WorkerCertifications = () => {
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [deletingCert, setDeletingCert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCertifications = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await certificationApi.getMyCertifications();
      if (res.success && Array.isArray(res.data)) {
        setCertifications(res.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 404
          ? 'Worker profile not found. Please complete your worker profile first.'
          : null) ||
        (err.response?.status === 403
          ? 'Access denied. Only registered workers can view certifications.'
          : null) ||
        'Unable to load your certifications. Please check your network connection.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const showSuccess = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner('');
    }, 4500);
  };

  const handleCreate = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await certificationApi.createCertification(payload);
      if (res.success && res.data) {
        setCertifications((prev) => [res.data, ...prev]);
        setIsAddModalOpen(false);
        showSuccess(`Certification "${res.data.name}" added successfully.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingCert) return;
    setIsSubmitting(true);
    try {
      const res = await certificationApi.updateCertification(editingCert.id, payload);
      if (res.success && res.data) {
        setCertifications((prev) =>
          prev.map((c) => (c.id === res.data.id ? res.data : c))
        );
        setEditingCert(null);
        showSuccess(`Certification "${res.data.name}" updated successfully.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (certId) => {
    setIsSubmitting(true);
    try {
      const res = await certificationApi.deleteCertification(certId);
      if (res.success) {
        setCertifications((prev) => prev.filter((c) => c.id !== certId));
        setDeletingCert(null);
        showSuccess('Certification deleted successfully.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to delete certification. Please try again.';
      setError(msg);
      setDeletingCert(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
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
            Worker Qualifications & Verification
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1
                style={{
                  fontSize: '30px',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Certifications
              </h1>
              {!isLoading && (
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0d9488',
                    background: '#f0fdfa',
                    border: '1px solid #ccfbf1',
                    padding: '2px 9px',
                    borderRadius: '9999px',
                  }}
                >
                  {certifications.length}
                </span>
              )}
            </div>
            <p style={{ fontSize: '15px', color: '#64748b', margin: '6px 0 0 0' }}>
              Manage your verified credentials, licenses, and professional qualifications.
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
            Add Certification
          </Button>
        </div>

        {/* Success Alert Banner */}
        {successBanner && (
          <div
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
              textAlign: 'left',
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

        {/* Certifications List / Grid */}
        <CertificationList
          certifications={certifications}
          isLoading={isLoading}
          error={error}
          onRetry={fetchCertifications}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onEditCertification={(cert) => setEditingCert(cert)}
          onDeleteCertification={(cert) => setDeletingCert(cert)}
        />

        {/* ADD CERTIFICATION MODAL */}
        {isAddModalOpen && (
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
              if (e.target === e.currentTarget && !isSubmitting) {
                setIsAddModalOpen(false);
              }
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                background: '#ffffff',
                borderRadius: '18px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                padding: '28px',
                animation: 'slideUp 0.25s ease-out',
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Add Certification
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Provide your credential details for verification
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
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

              <CertificationForm
                isEditMode={false}
                onSubmit={handleCreate}
                onCancel={() => setIsAddModalOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* EDIT CERTIFICATION MODAL */}
        {editingCert && (
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
              if (e.target === e.currentTarget && !isSubmitting) {
                setEditingCert(null);
              }
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                background: '#ffffff',
                borderRadius: '18px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                padding: '28px',
                animation: 'slideUp 0.25s ease-out',
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Edit Certification
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Update details for <strong style={{ color: '#0f172a' }}>{editingCert.name}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  disabled={isSubmitting}
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

              <CertificationForm
                initialData={editingCert}
                isEditMode={true}
                onSubmit={handleUpdate}
                onCancel={() => setEditingCert(null)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingCert && (
          <DeleteCertificationModal
            certification={deletingCert}
            onConfirm={handleDelete}
            onClose={() => setDeletingCert(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default WorkerCertifications;
