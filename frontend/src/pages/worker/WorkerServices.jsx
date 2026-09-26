import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import serviceApi from '../../services/service.api';
import ServiceList from '../../components/services/ServiceList';
import ServiceForm from '../../components/services/ServiceForm';
import DeleteServiceModal from '../../components/services/DeleteServiceModal';
import Button from '../../components/common/Button';

export const WorkerServices = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper for friendly error messages
  const parseErrorMessage = (err, fallback) => {
    if (err?.response) {
      const status = err.response.status;
      const msg = err.response.data?.message;
      if (status === 401) return 'Your session has expired. Please log in again.';
      if (status === 403) return 'Access denied. Only registered workers can manage services.';
      if (status === 404) return msg || 'Worker profile or service not found.';
      if (status === 400 || status === 422) return msg || 'Please verify the submitted service details.';
      if (status >= 500) return 'Server error. Please try again later.';
      if (msg) return msg;
    }
    return fallback || 'An unexpected error occurred. Please try again.';
  };

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setPageError('');

    try {
      const res = await serviceApi.getMyServices();
      if (res.success && Array.isArray(res.data)) {
        setServices(res.data);
      }
    } catch (err) {
      setPageError(
        parseErrorMessage(
          err,
          'Unable to load your services. Please check your network connection.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const showSuccess = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner('');
    }, 4500);
  };

  // Real Calculated Summary Statistics from API data
  const stats = useMemo(() => {
    const totalServices = services.length;
    const activeServices = services.filter((s) => s.status === 'ACTIVE').length;

    const uniqueCategories = new Set(
      services.map((s) => s.category?.trim()).filter(Boolean)
    ).size;

    let avgPriceDisplay = '₹0';
    if (totalServices > 0) {
      const totalPrice = services.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
      const avg = Math.round(totalPrice / totalServices);
      avgPriceDisplay = `₹${avg.toLocaleString('en-IN')}`;
    }

    return {
      totalServices,
      activeServices,
      categoriesCount: uniqueCategories,
      avgPriceDisplay,
    };
  }, [services]);

  // CREATE FLOW
  const handleCreate = async (payload) => {
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await serviceApi.createService(payload);
      if (res.success && res.data) {
        setServices((prev) => [res.data, ...prev]);
        setIsAddModalOpen(false);
        showSuccess(`Service "${res.data.name}" added successfully.`);
      }
    } catch (err) {
      setModalError(
        parseErrorMessage(err, 'Failed to add service. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // EDIT FLOW
  const handleUpdate = async (payload) => {
    if (!editingService) return;
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await serviceApi.updateService(editingService.id, payload);
      if (res.success && res.data) {
        setServices((prev) =>
          prev.map((item) => (item.id === res.data.id ? res.data : item))
        );
        setEditingService(null);
        showSuccess(`Service "${res.data.name}" updated successfully.`);
      }
    } catch (err) {
      setModalError(
        parseErrorMessage(err, 'Failed to update service. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE FLOW
  const handleDelete = async () => {
    if (!deletingService) return;
    setIsSubmitting(true);
    try {
      const res = await serviceApi.deleteService(deletingService.id);
      if (res.success) {
        const deletedTitle = deletingService.name;
        setServices((prev) => prev.filter((item) => item.id !== deletingService.id));
        setDeletingService(null);
        showSuccess(`Service "${deletedTitle}" was deleted.`);
      }
    } catch (err) {
      const msg = parseErrorMessage(err, 'Failed to delete service. Please try again.');
      setPageError(msg);
      setDeletingService(null);
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
            Worker Services & Catalog
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
                My Services
              </h1>
              {!isLoading && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#4f46e5',
                    background: '#eef2ff',
                    border: '1px solid #e0e7ff',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {services.length}
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Manage the services you offer, pricing, and estimated service duration.
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
            Add Service
          </Button>
        </div>

        {/* Summary Statistics Cards */}
        {!isLoading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
              textAlign: 'left',
            }}
          >
            {/* Metric 1: Total Services */}
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
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Services
                </span>
                <p style={{ margin: '1px 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {stats.totalServices}
                </p>
              </div>
            </div>

            {/* Metric 2: Active Services */}
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
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Active Services
                </span>
                <p style={{ margin: '1px 0 0', fontSize: '17px', fontWeight: 700, color: '#059669' }}>
                  {stats.activeServices}
                </p>
              </div>
            </div>

            {/* Metric 3: Categories */}
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
                  <path d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Categories
                </span>
                <p style={{ margin: '1px 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {stats.categoriesCount}
                </p>
              </div>
            </div>

            {/* Metric 4: Average Price */}
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
                <span style={{ fontSize: '14px', fontWeight: 800 }}>₹</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Average Price
                </span>
                <p style={{ margin: '1px 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {stats.avgPriceDisplay}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert Banner */}
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

        {/* Service Catalog List */}
        <ServiceList
          services={services}
          isLoading={isLoading}
          error={pageError}
          onRetry={fetchServices}
          onAdd={() => {
            setModalError('');
            setIsAddModalOpen(true);
          }}
          onEdit={(service) => {
            setModalError('');
            setEditingService(service);
          }}
          onDelete={(service) => {
            setDeletingService(service);
          }}
        />

        {/* Create Modal */}
        {isAddModalOpen && (
          <ServiceForm
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
        {editingService && (
          <ServiceForm
            isOpen={Boolean(editingService)}
            onClose={() => {
              setEditingService(null);
              setModalError('');
            }}
            initialData={editingService}
            isEditMode={true}
            onSubmit={handleUpdate}
            isLoading={isSubmitting}
            serverError={modalError}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingService && (
          <DeleteServiceModal
            isOpen={Boolean(deletingService)}
            service={deletingService}
            onClose={() => setDeletingService(null)}
            onConfirm={handleDelete}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default WorkerServices;
