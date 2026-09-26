import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import userApi from '../../services/user.api';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileInfo from '../../components/profile/ProfileInfo';
import EditProfileForm from '../../components/profile/EditProfileForm';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';

export const Profile = () => {
  const { user: authUser, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');

    try {
      const res = await userApi.getMyProfile();
      if (res.success && res.data?.user) {
        setProfile(res.data.user);
        if (updateUser) {
          updateUser(res.data.user);
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to load profile. Please check your network connection and try again.';
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveSuccess = (updatedUser) => {
    setProfile(updatedUser);
    if (updateUser) {
      updateUser(updatedUser);
    }
    setIsEditing(false);
    setSuccessBanner('Your profile has been successfully updated.');

    // Auto dismiss success banner after 4 seconds
    setTimeout(() => {
      setSuccessBanner('');
    }, 4000);
  };

  const dashboardPath = profile?.role === 'WORKER' || authUser?.role === 'WORKER'
    ? '/worker/dashboard'
    : '/customer/dashboard';

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
            to={dashboardPath}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#2563eb',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#eff6ff',
              transition: 'background 0.15s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Account Management
          </span>
        </div>

        {/* Page Title & Subtitle */}
        <div style={{ textAlign: 'left', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Profile
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            Manage your personal account information and credentials
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
            <Loader size="large" color="#2563eb" />
            <p style={{ marginTop: '16px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
              Loading account profile...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && (
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <ErrorMessage message={fetchError} />
            <Button variant="outline" size="small" onClick={fetchProfile}>
              Try Again
            </Button>
          </div>
        )}

        {/* Profile Content */}
        {!isLoading && profile && (
          <div>
            {/* Header Card */}
            <ProfileHeader user={profile} />

            {/* Main Information or Edit Form */}
            {isEditing ? (
              <EditProfileForm
                user={profile}
                onSaveSuccess={handleSaveSuccess}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <ProfileInfo
                user={profile}
                onEdit={() => setIsEditing(true)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
