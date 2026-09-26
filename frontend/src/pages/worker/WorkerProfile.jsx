import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import workerApi from '../../services/worker.api';
import skillApi from '../../services/skill.api';
import certificationApi from '../../services/certification.api';
import availabilityApi from '../../services/availability.api';
import serviceAreaApi from '../../services/serviceArea.api';
import serviceApi from '../../services/service.api';
import WorkerProfileHeader from '../../components/worker/WorkerProfileHeader';
import WorkerProfileInfo from '../../components/worker/WorkerProfileInfo';
import WorkerProfileForm from '../../components/worker/WorkerProfileForm';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';

export const WorkerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workerProfile, setWorkerProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [hasNoProfile, setHasNoProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [skillsCount, setSkillsCount] = useState(null);
  const [certificationsCount, setCertificationsCount] = useState(null);
  const [availabilityCount, setAvailabilityCount] = useState(null);
  const [serviceAreasCount, setServiceAreasCount] = useState(null);
  const [servicesCount, setServicesCount] = useState(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    setHasNoProfile(false);

    try {
      const res = await workerApi.getWorkerProfile();
      if (res.success && res.data?.workerProfile) {
        setWorkerProfile(res.data.workerProfile);
      }

      // Fetch worker skills count for profile summary
      try {
        const skillsRes = await skillApi.getMySkills();
        if (skillsRes.success && Array.isArray(skillsRes.data?.skills)) {
          setSkillsCount(skillsRes.data.skills.length);
        }
      } catch {
        // Non-blocking for profile display
      }

      // Fetch worker certifications count for profile summary
      try {
        const certsRes = await certificationApi.getMyCertifications();
        if (certsRes.success && Array.isArray(certsRes.data)) {
          setCertificationsCount(certsRes.data.length);
        }
      } catch {
        // Non-blocking for profile display
      }

      // Fetch worker availability count for profile summary
      try {
        const availRes = await availabilityApi.getMyAvailability();
        if (availRes.success && Array.isArray(availRes.data)) {
          setAvailabilityCount(availRes.data.length);
        }
      } catch {
        // Non-blocking for profile display
      }

      // Fetch worker service areas count for profile summary
      try {
        const areasRes = await serviceAreaApi.getMyServiceAreas();
        if (areasRes.success && Array.isArray(areasRes.data)) {
          setServiceAreasCount(areasRes.data.length);
        }
      } catch {
        // Non-blocking for profile display
      }

      // Fetch worker services count for profile summary
      try {
        const servicesRes = await serviceApi.getMyServices();
        if (servicesRes.success && Array.isArray(servicesRes.data)) {
          setServicesCount(servicesRes.data.length);
        }
      } catch {
        // Non-blocking for profile display
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // 404 indicates the worker has registered but has not yet filled their worker profile
        setHasNoProfile(true);
        setWorkerProfile(null);
      } else {
        const msg =
          err.response?.data?.message ||
          (err.response?.status === 403 ? 'Access denied. Only workers can view this page.' : null) ||
          'Unable to load worker profile. Please check your network connection.';
        setFetchError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleCreateSuccess = (newProfile) => {
    setWorkerProfile(newProfile);
    setHasNoProfile(false);
    setIsCreatingProfile(false);
    setSuccessBanner('Worker profile created successfully! Your verification is now pending.');

    setTimeout(() => {
      setSuccessBanner('');
    }, 4500);
  };

  const handleUpdateSuccess = (updatedProfile) => {
    setWorkerProfile(updatedProfile);
    setIsEditing(false);
    setSuccessBanner('Worker profile details updated successfully.');

    setTimeout(() => {
      setSuccessBanner('');
    }, 4000);
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
            Worker Services & Onboarding
          </span>
        </div>

        {/* Page Title & Subtitle */}
        <div style={{ textAlign: 'left', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Worker Profile
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            Manage your professional trade identity, verification status, and experience
          </p>
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

        {/* Loading Spinner */}
        {isLoading && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '80px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Loader size="large" color="#0d9488" />
            <p style={{ marginTop: '16px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
              Loading worker profile...
            </p>
          </div>
        )}

        {/* Generic Network/Auth Error */}
        {!isLoading && fetchError && (
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <ErrorMessage message={fetchError} />
            <Button variant="outline" size="small" onClick={fetchProfile}>
              Try Again
            </Button>
          </div>
        )}

        {/* ONBOARDING STATE: No Profile Exists Yet */}
        {!isLoading && hasNoProfile && !isCreatingProfile && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '48px 36px',
              textAlign: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: '#f0fdfa',
                border: '1px solid #ccfbf1',
                color: '#0d9488',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Complete your worker profile
            </h2>

            <p style={{ maxWidth: '520px', margin: '0 auto 28px', color: '#64748b', fontSize: '15px', lineHeight: 1.6 }}>
              Completing your profile allows customers and local labour cooperatives to understand your trade experience, verify your identity, and connect you with jobs.
            </p>

            <Button
              type="button"
              variant="primary"
              size="large"
              onClick={() => setIsCreatingProfile(true)}
              style={{ background: '#0d9488' }}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Create Worker Profile
            </Button>
          </div>
        )}

        {/* Form to Create Profile (from onboarding state) */}
        {!isLoading && hasNoProfile && isCreatingProfile && (
          <WorkerProfileForm
            isCreating
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreatingProfile(false)}
          />
        )}

        {/* Active Profile Display & Edit Flow */}
        {!isLoading && workerProfile && (
          <div>
            <WorkerProfileHeader workerProfile={workerProfile} userName={user?.name} />

            {isEditing ? (
              <WorkerProfileForm
                initialData={workerProfile}
                isCreating={false}
                onSuccess={handleUpdateSuccess}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
                <WorkerProfileInfo
                  workerProfile={workerProfile}
                  onEdit={() => setIsEditing(true)}
                />

                {/* Skills Quick Summary Card */}
                <div
                  style={{
                    marginTop: '20px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Skills</h3>
                      <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                        {skillsCount !== null ? `${skillsCount} skill${skillsCount === 1 ? '' : 's'} added` : 'Manage your skills'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    style={{ borderColor: '#6366f1', color: '#4f46e5' }}
                    onClick={() => navigate('/worker/skills')}
                  >
                    Manage Skills
                  </Button>
                </div>

                {/* Certifications Quick Summary Card */}
                <div
                  style={{
                    marginTop: '16px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: '#f0fdfa',
                        color: '#0d9488',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Certifications</h3>
                      <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                        {certificationsCount !== null ? `${certificationsCount} certification${certificationsCount === 1 ? '' : 's'} added` : 'Manage your verified credentials'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    style={{ borderColor: '#0d9488', color: '#0d9488' }}
                    onClick={() => navigate('/worker/certifications')}
                  >
                    Manage Certifications
                  </Button>
                </div>

                {/* Availability Quick Summary Card */}
                <div
                  style={{
                    marginTop: '16px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: '#eff6ff',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Availability</h3>
                      <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                        {availabilityCount !== null ? `${availabilityCount} time slot${availabilityCount === 1 ? '' : 's'} set` : 'Manage your recurring working hours'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    style={{ borderColor: '#0284c7', color: '#0284c7' }}
                    onClick={() => navigate('/worker/availability')}
                  >
                    Manage Availability
                  </Button>
                </div>

                {/* Service Areas Quick Summary Card */}
                <div
                  style={{
                    marginTop: '16px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: '#eef2ff',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Service Areas</h3>
                      <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                        {serviceAreasCount !== null ? `${serviceAreasCount} service area${serviceAreasCount === 1 ? '' : 's'} defined` : 'Manage the locations where you provide services'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    style={{ borderColor: '#4f46e5', color: '#4f46e5' }}
                    onClick={() => navigate('/worker/service-areas')}
                  >
                    Manage Service Areas
                  </Button>
                </div>

                {/* Services Quick Summary Card */}
                <div
                  style={{
                    marginTop: '16px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: '#f5f3ff',
                        color: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Services</h3>
                      <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                        {servicesCount !== null ? `${servicesCount} service${servicesCount === 1 ? '' : 's'} offered` : 'Manage the services and pricing you offer to customers'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    style={{ borderColor: '#7c3aed', color: '#7c3aed' }}
                    onClick={() => navigate('/worker/services')}
                  >
                    Manage Services
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerProfile;
