import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';
import {
  LayoutDashboard,
  HardHat,
  Users,
  Calendar,
  ClipboardList,
  Wrench,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
  FileCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const AdminLayout = ({ children, title = 'Admin Console', subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Workers', path: '/admin/workers', icon: HardHat },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'Service Requests', path: '/admin/service-requests', icon: ClipboardList },
    { label: 'Skills & Services', path: '/admin/services', icon: Wrench },
    { label: 'KYC / Documents', path: '/admin/documents', icon: FileCheck },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <aside
        style={{
          width: '260px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #1e293b',
          zIndex: 50,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          transform: mobileMenuOpen ? 'translateX(0)' : 'none',
        }}
        className="admin-sidebar"
      >
        {/* Sidebar Header */}
        <div>
          <div
            style={{
              padding: '24px 20px',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                }}
              >
                <Shield size={20} />
              </div>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', display: 'block', lineHeight: 1.2 }}>
                  Sahayog
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Admin Operations
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="admin-sidebar-close"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'none',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    background: isActive ? '#1e293b' : 'transparent',
                    borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.background = '#1e293b80';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} color={isActive ? '#38bdf8' : '#94a3b8'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} color="#64748b" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid #1e293b', background: '#0b1329' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#1e3a8a',
                border: '1.5px solid #38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                Platform Admin
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid #334155',
              color: '#cbd5e1',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1e293b';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = '#ef444450';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#cbd5e1';
              e.currentTarget.style.borderColor = '#334155';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: '260px',
        }}
        className="admin-main-wrapper"
      >
        {/* Top Header */}
        <header
          style={{
            height: '68px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Left: Mobile hamburger & Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="admin-mobile-toggle"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                padding: '6px',
                display: 'none',
              }}
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right: Actions, Notification Bell & Admin Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notification Bell */}
            <NotificationBell />

            <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} />

            {/* Admin Profile Chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                padding: '5px 10px',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                A
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                {user?.name ? user.name.split(' ')[0] : 'Admin'}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                ADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main style={{ flex: 1, padding: '28px', maxWidth: '1440px', width: '100%', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed !important;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-sidebar-close {
            display: block !important;
          }
          .admin-main-wrapper {
            margin-left: 0 !important;
          }
          .admin-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
