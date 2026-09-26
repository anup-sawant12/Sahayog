import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import workerApi from '../../services/worker.api';
import serviceApi from '../../services/service.api';
import availabilityApi from '../../services/availability.api';
import serviceAreaApi from '../../services/serviceArea.api';
import skillApi from '../../services/skill.api';
import certificationApi from '../../services/certification.api';
import documentApi from '../../services/document.api';
import bookingApi from '../../services/booking.api';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import { formatDate, formatTime12h, formatPriceUnit } from '../../components/bookings/BookingCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import WorkerBookingCalendar from '../../components/dashboard/WorkerBookingCalendar';
import NotificationBell from '../../components/notifications/NotificationBell';
import {
  ClipboardCheck,
  ClipboardList,
  Wrench,
  LogOut,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Briefcase,
  Bell,
  CheckCircle2,
  CheckCircle,
  IndianRupee,
  TrendingUp,
  Calendar,
  MapPin,
  Zap,
  Award,
  FileCheck,
  User,
  ArrowRight,
} from 'lucide-react';

export const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkerData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [
        profileRes,
        servicesRes,
        availRes,
        areasRes,
        skillsRes,
        certsRes,
        docsRes,
        bookingsRes,
      ] = await Promise.allSettled([
        workerApi.getWorkerProfile(),
        serviceApi.getMyServices(),
        availabilityApi.getMyAvailability(),
        serviceAreaApi.getMyServiceAreas(),
        skillApi.getMySkills(),
        certificationApi.getMyCertifications(),
        documentApi.getMyDocuments(),
        bookingApi.getWorkerBookings(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        const profileData = profileRes.value.data?.workerProfile || profileRes.value.data;
        setProfile(profileData);
      }
      if (servicesRes.status === 'fulfilled') {
        const servicesData = servicesRes.value?.data?.services || servicesRes.value?.data || [];
        setServices(Array.isArray(servicesData) ? servicesData : []);
      }
      if (availRes.status === 'fulfilled') {
        const availData = availRes.value?.data?.availability || availRes.value?.data || [];
        setAvailability(Array.isArray(availData) ? availData : []);
      }
      if (areasRes.status === 'fulfilled') {
        const areasData = areasRes.value?.data?.serviceAreas || areasRes.value?.data || [];
        setServiceAreas(Array.isArray(areasData) ? areasData : []);
      }
      if (skillsRes.status === 'fulfilled') {
        const skillsData = skillsRes.value?.data?.skills || skillsRes.value?.data || [];
        setSkills(Array.isArray(skillsData) ? skillsData : []);
      }
      if (certsRes.status === 'fulfilled') {
        const certsData = certsRes.value?.data?.certifications || certsRes.value?.data || [];
        setCertifications(Array.isArray(certsData) ? certsData : []);
      }
      if (docsRes.status === 'fulfilled') {
        const docsData = docsRes.value?.data || [];
        setDocuments(Array.isArray(docsData) ? docsData : []);
      }
      if (bookingsRes.status === 'fulfilled') {
        const bookingsData = bookingsRes.value?.data?.bookings || bookingsRes.value?.data || [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }
    } catch {
      // Graceful fallback to empty state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkerData();
  }, [fetchWorkerData]);

  // Dynamic Profile Completion Calculation
  const calculateCompletion = () => {
    let score = 0;
    const missing = [];

    if (profile) score += 15;
    else missing.push('Create Worker Profile');

    if (profile?.bio && profile.bio.trim().length > 10) score += 10;
    else missing.push('Add Professional Bio');

    if (profile?.experienceYears !== null && profile?.experienceYears !== undefined && profile.experienceYears > 0) score += 10;
    else missing.push('Set Years of Experience');

    if (profile?.profilePhotoUrl) score += 10;
    else missing.push('Upload Profile Photo');

    if (skills.length > 0) score += 15;
    else missing.push('Add Trade Skills');

    if (services.length > 0) score += 15;
    else missing.push('Add Services Offered');

    if (availability.length > 0) score += 10;
    else missing.push('Set Weekly Availability');

    if (serviceAreas.length > 0) score += 10;
    else missing.push('Define Service Areas');

    if (certifications.length > 0) score += 5;
    else missing.push('Add Certifications (Optional)');

    return { percentage: Math.min(100, score), missing };
  };

  const { percentage: completionPercentage, missing: missingItems } = calculateCompletion();

  // Real stats calculated from existing API data
  const totalBookings = bookings.length;
  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const confirmedJobs = bookings.filter((b) => b.status === 'CONFIRMED');
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  // Total earnings from completed bookings
  const totalEarnings = completedJobs.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const activeServicesCount = services.filter((s) => s.status === 'ACTIVE').length;

  const verificationStatus = profile?.verificationStatus || 'PENDING';

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px', textAlign: 'left' }}>
      {/* 1. Header with Worker Info & Quick Navigation */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
          borderRadius: '20px',
          padding: '36px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.25)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {profile?.profilePhotoUrl ? (
            <img
              src={profile.profilePhotoUrl}
              alt={user?.name || 'Worker'}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
          ) : (
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#ccfbf1',
                color: '#0f766e',
                fontSize: '26px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #ffffff',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={30} />}
            </div>
          )}

          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#99f6e4' }}>
              Worker Operations Portal
            </span>
            <h1
              style={{
                fontSize: '30px',
                fontWeight: 800,
                margin: '4px 0 6px',
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              Welcome back, {user?.name || 'Worker'} 👋
            </h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#ccfbf1' }}>
              Manage your services, incoming bookings, and schedule availability.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="large"
            onClick={() => navigate('/worker/bookings')}
            style={{
              background: '#ffffff',
              color: '#0f766e',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ClipboardCheck size={18} />
            Job Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </Button>

          <Button
            variant="outline"
            size="large"
            onClick={() => navigate('/worker/services')}
            style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Wrench size={16} />
            Manage Services
          </Button>

          <NotificationBell />

          <Button
            variant="ghost"
            size="large"
            onClick={logout}
            style={{ color: '#fed7aa', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </div>

      {/* 2. Verification Status Card */}
      <div
        style={{
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background:
            verificationStatus === 'APPROVED'
              ? '#ecfdf5'
              : verificationStatus === 'REJECTED'
              ? '#fef2f2'
              : '#fffbeb',
          border:
            verificationStatus === 'APPROVED'
              ? '1.5px solid #a7f3d0'
              : verificationStatus === 'REJECTED'
              ? '1.5px solid #fecaca'
              : '1.5px solid #fde68a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            {verificationStatus === 'APPROVED' ? (
              <ShieldCheck size={28} color="#059669" />
            ) : verificationStatus === 'REJECTED' ? (
              <AlertTriangle size={28} color="#dc2626" />
            ) : (
              <Clock size={28} color="#d97706" />
            )}
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '16px',
                color:
                  verificationStatus === 'APPROVED'
                    ? '#065f46'
                    : verificationStatus === 'REJECTED'
                    ? '#991b1b'
                    : '#92400e',
              }}
            >
              {verificationStatus === 'APPROVED'
                ? 'Profile Approved & Verified'
                : verificationStatus === 'REJECTED'
                ? 'Verification Needs Attention'
                : 'Awaiting Administrator Verification'}
            </div>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '13.5px',
                color:
                  verificationStatus === 'APPROVED'
                    ? '#047857'
                    : verificationStatus === 'REJECTED'
                    ? '#b91c1c'
                    : '#b45309',
              }}
            >
              {verificationStatus === 'APPROVED'
                ? 'Your profile is active, approved, and visible to customers looking for services in your areas.'
                : verificationStatus === 'REJECTED'
                ? 'Your profile verification was declined. Please verify your submitted documents and details.'
                : 'Your profile is under review by the cooperative team. Ensure your skills and services are filled out.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="small"
            onClick={() => navigate('/worker/documents')}
            style={{
              background: '#ffffff',
              borderColor:
                verificationStatus === 'APPROVED'
                  ? '#10b981'
                  : verificationStatus === 'REJECTED'
                  ? '#ef4444'
                  : '#f59e0b',
              color:
                verificationStatus === 'APPROVED'
                  ? '#065f46'
                  : verificationStatus === 'REJECTED'
                  ? '#991b1b'
                  : '#92400e',
              fontWeight: 700,
            }}
          >
            KYC Documents
          </Button>

          <Button
            variant="outline"
            size="small"
            onClick={() => navigate('/worker/profile')}
            style={{
              background: '#ffffff',
              borderColor: '#cbd5e1',
              color: '#334155',
            }}
          >
            View Profile
          </Button>
        </div>
      </div>

      {/* 3. Performance & Stats Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 22px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Requests
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              {isLoading ? '...' : totalBookings}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: pendingRequests.length > 0 ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
            padding: '20px 22px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Pending Action
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: pendingRequests.length > 0 ? '#d97706' : '#0f172a' }}>
              {isLoading ? '...' : pendingRequests.length}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 22px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Completed Jobs
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              {isLoading ? '...' : completedJobs.length}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 22px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Earnings
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Asymmetric Row: Profile Completion & Management Shortcuts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Profile Completion Box */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px 28px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="#0d9488" />
                Profile Completion
              </h2>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0d9488' }}>
                {completionPercentage}%
              </span>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#64748b' }}>
              Complete your profile to increase visibility and improve match score for customers.
            </p>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '10px',
                background: '#e2e8f0',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: `${completionPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0d9488 0%, #10b981 100%)',
                  borderRadius: '9999px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            {missingItems.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Recommended additions:
                </span>
                <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {missingItems.slice(0, 3).map((item, idx) => (
                    <li key={idx} style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} color="#0d9488" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <Button
              variant="primary"
              size="small"
              onClick={() => navigate('/worker/profile')}
              style={{ background: '#0d9488', color: '#ffffff' }}
            >
              Complete Profile
            </Button>
          </div>
        </div>

        {/* Worker Setup Shortcuts Grid */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px 28px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
            Platform Modules
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div
              onClick={() => navigate('/worker/services')}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0d9488')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Wrench size={20} color="#0d9488" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>Services</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{activeServicesCount} active</div>
            </div>

            <div
              onClick={() => navigate('/worker/availability')}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0284c7')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Calendar size={20} color="#0284c7" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>Availability</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{availability.length} schedule slots</div>
            </div>

            <div
              onClick={() => navigate('/worker/service-areas')}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ea580c')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <MapPin size={20} color="#ea580c" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>Service Areas</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{serviceAreas.length} localities</div>
            </div>

            <div
              onClick={() => navigate('/worker/skills')}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d97706')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Zap size={20} color="#d97706" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>Trade Skills</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{skills.length} skills listed</div>
            </div>

            <div
              onClick={() => navigate('/worker/certifications')}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7c3aed')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Award size={20} color="#7c3aed" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>Certifications</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{certifications.length} verified</div>
            </div>

            <div
              onClick={() => navigate('/worker/documents')}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0d9488')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <FileCheck size={20} color="#0d9488" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>Documents / KYC</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {documents.filter((d) => d.verificationStatus === 'VERIFIED').length} of 5 verified
              </div>
            </div>

            <div
              onClick={() => navigate('/profile')}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#475569')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <User size={20} color="#475569" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>Account</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Personal settings</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Professional Interactive Booking Calendar */}
      <WorkerBookingCalendar
        bookings={bookings}
        isLoading={isLoading}
        onRetry={fetchWorkerData}
      />

      {/* 6. Pending & Recent Job Requests Section */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>
              Pending & Active Job Requests
            </h2>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
              Service jobs booked by customers requiring your attention
            </p>
          </div>

          <Button
            variant="outline"
            size="small"
            onClick={() => navigate('/worker/bookings')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            All Bookings ({bookings.length}) <ArrowRight size={14} />
          </Button>
        </div>

        {isLoading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <Loader size="medium" color="#0d9488" />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <ClipboardList size={24} color="#64748b" />
            </div>
            <p style={{ margin: 0, fontSize: '14px' }}>
              No job requests yet. When customers book your services, they will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: b.status === 'PENDING' ? '#fffbeb' : '#f8fafc',
                  border: b.status === 'PENDING' ? '1.5px solid #fde68a' : '1px solid #f1f5f9',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                    {b.workerService?.name || b.serviceRequest?.serviceName || 'Service Request'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} color="#64748b" />
                      Customer: <strong>{b.customer?.name || 'Customer'}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="#64748b" />
                      {formatDate(b.scheduledDate)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#64748b" />
                      {formatTime12h(b.scheduledTime)}
                    </span>
                  </div>
                  {b.serviceRequest && (
                    <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#64748b" />
                      {b.serviceRequest.area}, {b.serviceRequest.city}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {formatPriceUnit(b.price, b.workerService?.pricingUnit)}
                  </div>
                  <BookingStatusBadge status={b.status} size="small" />
                  <Button
                    variant={b.status === 'PENDING' ? 'primary' : 'outline'}
                    size="small"
                    onClick={() => navigate(`/worker/bookings/${b.id}`)}
                    style={
                      b.status === 'PENDING'
                        ? { background: '#d97706', borderColor: '#d97706', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '4px' }
                        : { display: 'inline-flex', alignItems: 'center', gap: '4px' }
                    }
                  >
                    {b.status === 'PENDING' ? 'Review & Accept' : 'View Job'}
                    <ArrowRight size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
