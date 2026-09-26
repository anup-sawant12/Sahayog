import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import userApi from '../../services/user.api';
import { getCustomerBookings } from '../../services/booking.api';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import { formatDate, formatTime12h, formatPriceUnit } from '../../components/bookings/BookingCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import NotificationBell from '../../components/notifications/NotificationBell';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  CalendarDays,
  PlusCircle,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Sparkles,
  TreePine,
  Cpu,
  BrickWall,
  LogOut,
  IndianRupee,
} from 'lucide-react';

const POPULAR_CATEGORIES = [
  { name: 'Electrical', icon: Zap, color: '#d97706', bg: '#fef3c7', desc: 'Wiring, fixtures & repairs' },
  { name: 'Plumbing', icon: Droplets, color: '#0284c7', bg: '#e0f2fe', desc: 'Pipes, taps & leakages' },
  { name: 'Carpentry', icon: Hammer, color: '#b45309', bg: '#fef3c7', desc: 'Furniture & woodwork' },
  { name: 'Painting', icon: Paintbrush, color: '#db2777', bg: '#fce7f3', desc: 'Interior & exterior' },
  { name: 'Cleaning', icon: Sparkles, color: '#7c3aed', bg: '#ede9fe', desc: 'Deep cleaning & sanitization' },
  { name: 'Gardening', icon: TreePine, color: '#059669', bg: '#d1fae5', desc: 'Lawn care & maintenance' },
  { name: 'Appliance Repair', icon: Cpu, color: '#4f46e5', bg: '#e0e7ff', desc: 'AC, fridge & machines' },
  { name: 'Masonry', icon: BrickWall, color: '#ea580c', bg: '#ffedd5', desc: 'Tiles, plaster & structural' },
];

export const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [customerProfile, setCustomerProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchCustomerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileRes, bookingsRes] = await Promise.allSettled([
        userApi.getMyProfile(),
        getCustomerBookings(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        const profileData = profileRes.value.data?.user || profileRes.value.data;
        setCustomerProfile(profileData);
      }

      if (bookingsRes.status === 'fulfilled') {
        const bookingsData = bookingsRes.value?.data?.bookings || bookingsRes.value?.data || [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }
    } catch {
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  // Derived real stats from existing API data
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'CONFIRMED'
  ).length;
  const upcomingConfirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;

  // Closest active or upcoming booking
  const activeOrUpcoming = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING')
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))[0];

  // Up to 5 recent bookings/requests
  const recentBookings = bookings.slice(0, 5);

  const handleCategoryClick = (categoryName) => {
    navigate('/customer/request-service', { state: { category: categoryName } });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px', textAlign: 'left' }}>
      {/* 1. Header / Greeting Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          borderRadius: '20px',
          padding: '36px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(30, 64, 175, 0.25)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#93c5fd' }}>
            Customer Marketplace Portal
          </span>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              margin: '6px 0 8px',
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            {getGreeting()}, {customerProfile?.name || user?.name || 'Customer'} 👋
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#dbeafe', maxWidth: '520px' }}>
            What service do you need today? Connect instantly with verified skilled professionals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="large"
            onClick={() => navigate('/customer/request-service')}
            style={{
              background: '#ffffff',
              color: '#1e40af',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Search size={18} />
            Find a Service
          </Button>

          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <Button
              variant="outline"
              size="large"
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <User size={16} />
              Profile
            </Button>
          </Link>

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

      {/* 2. Customer Activity Summary (Real API statistics) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ClipboardList size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Bookings
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {isLoading ? '...' : totalBookings}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Requests
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {isLoading ? '...' : activeBookings}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#f0fdfa',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarDays size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Upcoming Confirmed
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {isLoading ? '...' : upcomingConfirmed}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Completed Jobs
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {isLoading ? '...' : completedBookings}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Asymmetric Layout (Left: Upcoming Booking & Quick Actions / Right: Categories) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          marginBottom: '36px',
        }}
      >
        {/* Left Column: Active / Upcoming Booking */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Active / Upcoming Booking
            </h2>
            <Link to="/customer/bookings" style={{ fontSize: '13.5px', color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View all bookings <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '36px', textAlign: 'center' }}>
              <Loader size="medium" />
            </div>
          ) : activeOrUpcoming ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #bfdbfe',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.06)',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>
                    {activeOrUpcoming.workerService?.name || activeOrUpcoming.serviceRequest?.serviceName || 'Service Booking'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={15} color="#64748b" />
                    Worker: <strong style={{ color: '#1e293b' }}>{activeOrUpcoming.worker?.name || 'Verified Worker'}</strong>
                  </p>
                </div>
                <BookingStatusBadge status={activeOrUpcoming.status} size="small" />
              </div>

              <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  {formatPriceUnit(activeOrUpcoming.price, activeOrUpcoming.workerService?.pricingUnit)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13.5px', color: '#475569', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#2563eb" />
                    {formatDate(activeOrUpcoming.scheduledDate)}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} color="#2563eb" />
                    {formatTime12h(activeOrUpcoming.scheduledTime)}
                  </span>
                </div>

                {activeOrUpcoming.serviceRequest && (
                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <MapPin size={15} color="#64748b" />
                    {activeOrUpcoming.serviceRequest.area}, {activeOrUpcoming.serviceRequest.city}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => navigate(`/customer/bookings/${activeOrUpcoming.id}`)}
                >
                  View Booking Details
                </Button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '36px 24px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <CalendarDays size={26} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                No upcoming bookings
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 18px', maxWidth: '320px', marginInline: 'auto' }}>
                Book a skilled verified worker for your next home or commercial service.
              </p>
              <Button
                variant="primary"
                size="small"
                onClick={() => navigate('/customer/request-service')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Search size={16} />
                Find a Service
              </Button>
            </div>
          )}

          {/* Quick Actions Strip */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div
                onClick={() => navigate('/customer/request-service')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <PlusCircle size={20} color="#2563eb" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Request Service</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Post task for matching</div>
              </div>

              <div
                onClick={() => navigate('/customer/bookings')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <ClipboardList size={20} color="#2563eb" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>My Bookings</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Track scheduled jobs</div>
              </div>

              <div
                onClick={() => navigate('/profile')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <User size={20} color="#2563eb" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>My Profile</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Account settings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Service Categories */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Popular Categories
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Select to prefill request</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px',
            }}
          >
            {POPULAR_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategoryClick(cat.name)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = cat.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: cat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent size={20} color={cat.color} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{cat.name}</span>
                  <span style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.3 }}>{cat.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Request & Booking Activity Feed */}
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
              Recent Booking Activity
            </h2>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
              Latest service requests and assigned workers
            </p>
          </div>

          {bookings.length > 5 && (
            <Link to="/customer/bookings" style={{ fontSize: '13.5px', color: '#2563eb', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View all ({bookings.length}) <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <Loader size="medium" />
          </div>
        ) : recentBookings.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: '0 0 14px', fontSize: '14px' }}>
              No service activity recorded yet.
            </p>
            <Button
              variant="primary"
              size="small"
              onClick={() => navigate('/customer/request-service')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <PlusCircle size={16} />
              Request Your First Service
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                    {b.workerService?.name || b.serviceRequest?.serviceName || 'Service Job'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} color="#64748b" />
                      Worker: {b.worker?.name || 'Assigned Worker'}
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
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {formatPriceUnit(b.price, b.workerService?.pricingUnit)}
                  </div>
                  <BookingStatusBadge status={b.status} size="small" />
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => navigate(`/customer/bookings/${b.id}`)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View <ArrowRight size={13} />
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

export default CustomerDashboard;
