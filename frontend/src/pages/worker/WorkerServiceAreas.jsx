import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import serviceAreaApi from '../../services/serviceArea.api';
import ServiceAreaList from '../../components/serviceAreas/ServiceAreaList';
import ServiceAreaForm from '../../components/serviceAreas/ServiceAreaForm';
import DeleteServiceAreaModal from '../../components/serviceAreas/DeleteServiceAreaModal';
import Button from '../../components/common/Button';

/**
 * WorkerServiceAreas Page
 * Allows a WORKER to manage the locations and geographical areas where they provide services.
 */
export const WorkerServiceAreas = () => {
  const [serviceAreas, setServiceAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [deletingArea, setDeletingArea] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper for friendly error messages
  const parseErrorMessage = (err, fallback) => {
    if (err?.response) {
      const status = err.response.status;
      const msg = err.response.data?.message;
      if (status === 401) return 'Your session has expired. Please log in again.';
      if (status === 403) return 'Access denied. Only registered workers can manage service areas.';
      if (status === 404) return msg || 'Worker profile or service area not found.';
      if (status === 409) return msg || 'A service area with this city, area, and pincode already exists.';
      if (status === 400 || status === 422) return msg || 'Please verify the submitted details.';
      if (status >= 500) return 'Server error. Please try again later.';
      if (msg) return msg;
    }
    return fallback || 'An unexpected error occurred. Please try again.';
  };

  const fetchServiceAreas = useCallback(async () => {
    setIsLoading(true);
    setPageError('');

    try {
      const res = await serviceAreaApi.getMyServiceAreas();
      if (res.success && Array.isArray(res.data)) {
        setServiceAreas(res.data);
      }
    } catch (err) {
      setPageError(
        parseErrorMessage(
          err,
          'Unable to load your service areas. Please check your network connection.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceAreas();
  }, [fetchServiceAreas]);

  const showSuccess = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner('');
    }, 4500);
  };

  // Dynamic calculated summary metrics from actual API data
  const summary = useMemo(() => {
    const totalCount = serviceAreas.length;
    const primary = serviceAreas.find((a) => a.isPrimary);

    let primaryAreaText = 'Not set';
    let serviceRadiusText = 'Not set';

    if (primary) {
      primaryAreaText = `${primary.city} · ${primary.area}`;
      serviceRadiusText = `${primary.serviceRadiusKm || 10} km`;
    }

    return {
      totalCount,
      primaryAreaText,
      serviceRadiusText
    };
  }, [serviceAreas]);

  // CREATE FLOW
  const handleCreate = async (payload) => {
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await serviceAreaApi.createServiceArea(payload);
      if (res.success && res.data) {
        if (res.data.isPrimary) {
          setServiceAreas((prev) => [
            res.data,
            ...prev.map((item) => ({ ...item, isPrimary: false }))
          ]);
        } else {
          setServiceAreas((prev) => [res.data, ...prev]);
        }
        setIsAddModalOpen(false);
        showSuccess(`Service area "${res.data.area}, ${res.data.city}" added successfully.`);
      }
    } catch (err) {
      setModalError(
        parseErrorMessage(err, 'Failed to add service area. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // EDIT FLOW
  const handleUpdate = async (payload) => {
    if (!editingArea) return;
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await serviceAreaApi.updateServiceArea(editingArea.id, payload);
      if (res.success && res.data) {
        setServiceAreas((prev) =>
          prev.map((item) => {
            if (item.id === res.data.id) {
              return res.data;
            }
            if (res.data.isPrimary) {
              return { ...item, isPrimary: false };
            }
            return item;
          })
        );
        setEditingArea(null);
        showSuccess(`Service area "${res.data.area}, ${res.data.city}" updated successfully.`);
      }
    } catch (err) {
      setModalError(
        parseErrorMessage(err, 'Failed to update service area. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE FLOW
  const handleDelete = async () => {
    if (!deletingArea) return;
    setIsSubmitting(true);
    try {
      const res = await serviceAreaApi.deleteServiceArea(deletingArea.id);
      if (res.success) {
        const deletedTitle = `${deletingArea.area}, ${deletingArea.city}`;
        setServiceAreas((prev) => prev.filter((item) => item.id !== deletingArea.id));
        setDeletingArea(null);
        showSuccess(`Service area "${deletedTitle}" was removed.`);
      }
    } catch (err) {
      const msg = parseErrorMessage(err, 'Failed to delete service area. Please try again.');
      setPageError(msg);
      setDeletingArea(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px 16px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb / Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <Link
            to="/worker/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0d9488',
              textDecoration: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#f0fdfa',
              transition: 'background 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Worker Operations & Coverage
          </span>
        </div>

        {/* Page Header with Action Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Service Areas
              </h1>
              {!isLoading && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0d9488',
                    background: '#f0fdfa',
                    border: '1px solid #ccfbf1',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {serviceAreas.length}
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Choose the areas where you're available to provide your services.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={() => {
              setModalError('');
              setIsAddModalOpen(true);
            }}
            style={{
              background: '#4f46e5',
              height: '34px',
              padding: '0 14px',
              fontSize: '13px',
              gap: '6px',
            }}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Add Service Area
          </Button>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
              animation: 'fadeIn 0.2s ease-out',
              textAlign: 'left',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ flex: 1 }}>{successBanner}</span>
            <button
              type="button"
              onClick={() => setSuccessBanner('')}
              aria-label="Dismiss banner"
              style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: 0, fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Page Error */}
        {pageError && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '13px',
              marginBottom: '16px',
              textAlign: 'left',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ flex: 1 }}>{pageError}</span>
            <button
              type="button"
              onClick={() => setPageError('')}
              aria-label="Dismiss error"
              style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', padding: 0, fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Summary Statistics Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
            textAlign: 'left',
          }}
        >
          {/* Metric 1: Service Areas */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '12px 14px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Service Areas
              </span>
              <p style={{ margin: '1px 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                {summary.totalCount}
              </p>
            </div>
          </div>

          {/* Metric 2: Primary Area */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '12px 14px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Primary Area
              </span>
              <p style={{ margin: '1px 0 0', fontSize: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {summary.primaryAreaText}
              </p>
            </div>
          </div>

          {/* Metric 3: Service Radius */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '12px 14px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#f0fdfa',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 12l4 4" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Service Radius
              </span>
              <p style={{ margin: '1px 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                {summary.serviceRadiusText}
              </p>
            </div>
          </div>
        </div>

        {/* Service Area Cards / List */}
        <ServiceAreaList
          serviceAreas={serviceAreas}
          isLoading={isLoading}
          error={pageError}
          onAdd={() => {
            setModalError('');
            setIsAddModalOpen(true);
          }}
          onEdit={(area) => {
            setModalError('');
            setEditingArea(area);
          }}
          onDelete={(area) => {
            setDeletingArea(area);
          }}
        />

        {/* Create Modal */}
        {isAddModalOpen && (
          <ServiceAreaForm
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setModalError('');
            }}
            onSubmit={handleCreate}
            isLoading={isSubmitting}
            serverError={modalError}
          />
        )}

        {/* Edit Modal */}
        {editingArea && (
          <ServiceAreaForm
            isOpen={Boolean(editingArea)}
            onClose={() => {
              setEditingArea(null);
              setModalError('');
            }}
            initialData={editingArea}
            onSubmit={handleUpdate}
            isLoading={isSubmitting}
            serverError={modalError}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingArea && (
          <DeleteServiceAreaModal
            isOpen={Boolean(deletingArea)}
            serviceArea={deletingArea}
            onClose={() => setDeletingArea(null)}
            onConfirm={handleDelete}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default WorkerServiceAreas;
