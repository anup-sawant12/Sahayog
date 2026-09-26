import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import availabilityApi from '../../services/availability.api';
import AvailabilityList from '../../components/availability/AvailabilityList';
import AvailabilityForm from '../../components/availability/AvailabilityForm';
import DeleteAvailabilityModal from '../../components/availability/DeleteAvailabilityModal';
import Button from '../../components/common/Button';

const calculateDurationHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  const startMinutes = h1 * 60 + m1;
  const endMinutes = h2 * 60 + m2;
  if (endMinutes <= startMinutes) return 0;
  return (endMinutes - startMinutes) / 60;
};

export const WorkerAvailability = () => {
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedDay, setPreselectedDay] = useState('MONDAY');
  const [editingSlot, setEditingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAvailability = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await availabilityApi.getMyAvailability();
      if (res.success && Array.isArray(res.data)) {
        setAvailability(res.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 404
          ? 'Worker profile not found. Please complete your worker profile first.'
          : null) ||
        (err.response?.status === 403
          ? 'Access denied. Only registered workers can manage availability.'
          : null) ||
        'Unable to load your availability schedule. Please check your network connection.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const showSuccess = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner('');
    }, 4500);
  };

  // Real Calculated Summary Statistics
  const stats = useMemo(() => {
    const availableSlots = availability.filter((s) => s.isAvailable !== false);

    const availableDaysCount = new Set(availableSlots.map((s) => s.dayOfWeek)).size;
    const totalSlotsCount = availability.length;

    const totalHours = availableSlots.reduce((acc, s) => {
      return acc + calculateDurationHours(s.startTime, s.endTime);
    }, 0);

    const formattedHours = Number.isInteger(totalHours)
      ? `${totalHours} hrs/week`
      : `${totalHours.toFixed(1)} hrs/week`;

    return {
      availableDays: availableDaysCount,
      totalSlots: totalSlotsCount,
      weeklyHours: formattedHours,
    };
  }, [availability]);

  const handleCreate = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await availabilityApi.createAvailability(payload);
      if (res.success && res.data) {
        setAvailability((prev) => [...prev, res.data]);
        setIsAddModalOpen(false);
        showSuccess('Availability slot added to your schedule.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingSlot) return;
    setIsSubmitting(true);
    try {
      const res = await availabilityApi.updateAvailability(editingSlot.id, payload);
      if (res.success && res.data) {
        setAvailability((prev) =>
          prev.map((s) => (s.id === res.data.id ? res.data : s))
        );
        setEditingSlot(null);
        showSuccess('Availability slot updated.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (slotId) => {
    setIsSubmitting(true);
    try {
      const res = await availabilityApi.deleteAvailability(slotId);
      if (res.success) {
        setAvailability((prev) => prev.filter((s) => s.id !== slotId));
        setDeletingSlot(null);
        showSuccess('Availability slot removed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete availability slot.';
      setError(msg);
      setDeletingSlot(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddForDay = (dayKey) => {
    setPreselectedDay(dayKey);
    setIsAddModalOpen(true);
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
            Worker Operations & Weekly Schedule
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
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              My Availability
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Set the days and hours when you're available to accept work.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={() => {
              setPreselectedDay('MONDAY');
              setIsAddModalOpen(true);
            }}
            style={{
              background: '#0d9488',
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
            Add Availability
          </Button>
        </div>

        {/* Summary Statistics Cards */}
        {!isLoading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
              textAlign: 'left',
            }}
          >
            {/* Available Days */}
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Available Days
                </span>
                <p style={{ margin: '1px 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {stats.availableDays} / 7
                </p>
              </div>
            </div>

            {/* Total Time Slots */}
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
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Time Slots
                </span>
                <p style={{ margin: '1px 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {stats.totalSlots}
                </p>
              </div>
            </div>

            {/* Weekly Hours */}
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
                  background: '#fdf2f8',
                  color: '#db2777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Weekly Working Hours
                </span>
                <p style={{ margin: '1px 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {stats.weeklyHours}
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

        {/* Global Error Banner */}
        {error && (
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
            <span style={{ flex: 1 }}>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
              style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', padding: 0, fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* 7-Day Schedule List */}
        <AvailabilityList
          availability={availability}
          isLoading={isLoading}
          error={error}
          onRetry={fetchAvailability}
          onOpenAddModal={() => {
            setPreselectedDay('MONDAY');
            setIsAddModalOpen(true);
          }}
          onAddSlotForDay={handleOpenAddForDay}
          onEditSlot={(slot) => setEditingSlot(slot)}
          onDeleteSlot={(slot) => setDeletingSlot(slot)}
        />

        {/* CREATE MODAL */}
        {isAddModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              animation: 'fadeIn 0.15s ease-out',
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
                maxWidth: '440px',
                background: '#ffffff',
                borderRadius: '14px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                padding: '20px',
                animation: 'slideUp 0.2s ease-out',
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                    Add Availability
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Set your working hours for a day of the week
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
                    fontSize: '18px',
                    padding: '2px',
                  }}
                >
                  ✕
                </button>
              </div>

              <AvailabilityForm
                preselectedDay={preselectedDay}
                isEditMode={false}
                onSubmit={handleCreate}
                onCancel={() => setIsAddModalOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editingSlot && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              animation: 'fadeIn 0.15s ease-out',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !isSubmitting) {
                setEditingSlot(null);
              }
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                background: '#ffffff',
                borderRadius: '14px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                padding: '20px',
                animation: 'slideUp 0.2s ease-out',
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                    Edit Availability
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Update working slot schedule
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  disabled={isSubmitting}
                  aria-label="Close modal"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '2px',
                  }}
                >
                  ✕
                </button>
              </div>

              <AvailabilityForm
                initialData={editingSlot}
                isEditMode={true}
                onSubmit={handleUpdate}
                onCancel={() => setEditingSlot(null)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingSlot && (
          <DeleteAvailabilityModal
            slot={deletingSlot}
            onConfirm={handleDelete}
            onClose={() => setDeletingSlot(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default WorkerAvailability;
