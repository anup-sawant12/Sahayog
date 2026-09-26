import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import adminApi from '../../services/admin.api';
import Loader from '../../components/common/Loader';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  HardHat,
  Award,
  Calendar,
  MapPin,
  Briefcase,
  AlertCircle,
  Shield,
  Phone,
  Mail,
  User,
  Check,
  X,
} from 'lucide-react';

export const AdminWorkerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchWorkerDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getWorkerById(id);
      if (res.success && res.data) {
        setWorker(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load worker profile details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkerDetails();
  }, [fetchWorkerDetails]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      setActionSuccess(null);
      const res = await adminApi.approveWorker(id);
      if (res.success) {
        setWorker((prev) => ({
          ...prev,
          verificationStatus: 'APPROVED',
        }));
        setActionSuccess('Worker profile has been verified and approved.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve worker.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      setShowRejectModal(false);
      setActionSuccess(null);
      const res = await adminApi.rejectWorker(id);
      if (res.success) {
        setWorker((prev) => ({
          ...prev,
          verificationStatus: 'REJECTED',
        }));
        setActionSuccess('Worker verification status updated to Rejected.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject worker.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
          >
            <CheckCircle size={14} />
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            }}
          >
            <XCircle size={14} />
            REJECTED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              background: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fde68a',
            }}
          >
            <Clock size={14} />
            PENDING REVIEW
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="Worker Profile Review"
      subtitle="Examine credentials, skills, availability, and verify eligibility"
    >
      {/* Top back button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => navigate('/admin/workers')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 0',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          <ArrowLeft size={16} />
          Back to Workers List
        </button>
      </div>

      {/* Success notification banner */}
      {actionSuccess && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#15803d',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#b91c1c',
            fontSize: '14px',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader size="large" />
        </div>
      ) : worker ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Profile Header Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '18px',
                  background: '#eff6ff',
                  border: '2px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1d4ed8',
                  fontSize: '28px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {worker.user?.name ? worker.user.name.charAt(0).toUpperCase() : 'W'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
                    {worker.user?.name || 'Worker Name'}
                  </h2>
                  {getStatusBadge(worker.verificationStatus)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={14} color="#94a3b8" />
                    {worker.user?.email || 'No email provided'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={14} color="#94a3b8" />
                    {worker.user?.phone || 'No phone provided'}
                  </span>
                  <span>Registered: {new Date(worker.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Approve / Reject */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {worker.verificationStatus !== 'APPROVED' && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px 0 rgba(22, 163, 74, 0.2)',
                  }}
                >
                  <Check size={16} />
                  <span>Approve Worker</span>
                </button>
              )}

              {worker.verificationStatus !== 'REJECTED' && (
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <X size={16} />
                  <span>Reject</span>
                </button>
              )}
            </div>
          </div>

          {/* Bookings Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
            }}
          >
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>TOTAL BOOKINGS</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                {worker.bookingSummary?.total ?? 0}
              </div>
            </div>
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>COMPLETED</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
                {worker.bookingSummary?.completed ?? 0}
              </div>
            </div>
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#b45309' }}>PENDING</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#b45309', marginTop: '4px' }}>
                {worker.bookingSummary?.pending ?? 0}
              </div>
            </div>
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#b91c1c' }}>CANCELLED</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#b91c1c', marginTop: '4px' }}>
                {worker.bookingSummary?.cancelled ?? 0}
              </div>
            </div>
          </div>

          {/* Profile Bio & Experience */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Professional Background
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
              {worker.bio || 'No professional bio entered by the worker yet.'}
            </p>
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#64748b' }}>
              <div>
                <strong>Experience:</strong> {worker.experienceYears ? `${worker.experienceYears} Years` : 'Entry Level'}
              </div>
              <div>
                <strong>Account Status:</strong> {worker.user?.status || 'ACTIVE'}
              </div>
            </div>
          </div>

          {/* Two-column layout for details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Skills */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <HardHat size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Skills ({worker.skills?.length || 0})
                </h3>
              </div>
              {worker.skills && worker.skills.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {worker.skills.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        {s.skill?.name || 'Skill'}
                      </span>
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
                        {s.level || 'INTERMEDIATE'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>No skills listed.</p>
              )}
            </div>

            {/* Services Offered */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Briefcase size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Services Catalog ({worker.services?.length || 0})
                </h3>
              </div>
              {worker.services && worker.services.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {worker.services.map((srv) => (
                    <div
                      key={srv.id}
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                          {srv.serviceName}
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{srv.category}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>
                          ₹{srv.basePrice}
                        </div>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>per {srv.pricingUnit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>No services configured.</p>
              )}
            </div>

            {/* Certifications */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Award size={18} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Certifications ({worker.certifications?.length || 0})
                </h3>
              </div>
              {worker.certifications && worker.certifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {worker.certifications.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        {c.certificateName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Issued by: {c.issuingOrganization || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>No certifications uploaded.</p>
              )}
            </div>

            {/* Service Areas */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MapPin size={18} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Operational Areas ({worker.serviceAreas?.length || 0})
                </h3>
              </div>
              {worker.serviceAreas && worker.serviceAreas.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {worker.serviceAreas.map((sa) => (
                    <div
                      key={sa.id}
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                          {sa.area}, {sa.city}
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Pincode: {sa.pincode}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#475569' }}>
                        {sa.radiusKm ? `${sa.radiusKm} km radius` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>No service areas configured.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Rejection Confirmation Modal */}
      {showRejectModal && (
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
              padding: '28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={24} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
              Reject Worker Verification?
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              Are you sure you want to reject this worker's verification? The worker will not be eligible to appear in customer matching results.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
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
                type="button"
                onClick={handleReject}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#dc2626',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWorkerDetails;
