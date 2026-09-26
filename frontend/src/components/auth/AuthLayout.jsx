export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-wrapper">
      {/* LEFT COLUMN: BRANDING & TRUST HERO */}
      <aside className="auth-hero-panel">
        <div className="auth-hero-content">
          {/* Logo & Brand Identity */}
          <div className="auth-brand-header">
            <div className="auth-brand-icon">
              {/* Cooperative Hands / Shield SVG */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div className="auth-brand-text">
              <span className="auth-brand-name">Sahayog</span>
              <span className="auth-brand-tag">Labour Cooperative</span>
            </div>
          </div>

          {/* Main Headline & Mission */}
          <div className="auth-hero-main">
            <h1 className="auth-hero-headline">
              Trusted skilled workers, <br />
              <span className="text-highlight">one platform.</span>
            </h1>
            <p className="auth-hero-subtext">
              Directly connect with certified, verified labour cooperatives. Fair wages for skilled workers, reliable on-demand services for customers.
            </p>

            {/* Subtle Abstract Visual Pattern / Community Graphic */}
            <div className="auth-abstract-visual" aria-hidden="true">
              <div className="metric-pill">
                <span className="metric-dot"></span>
                <span>Government & Cooperative Affiliated</span>
              </div>
              <div className="metric-card-grid">
                <div className="mini-stat-card">
                  <span className="stat-number">10,000+</span>
                  <span className="stat-label">Verified Labourers</span>
                </div>
                <div className="mini-stat-card">
                  <span className="stat-number">99.4%</span>
                  <span className="stat-label">Satisfaction Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators / Badges */}
          <div className="auth-trust-badges">
            <div className="trust-badge-item">
              <div className="trust-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="trust-badge-content">
                <span className="trust-title">Verified Workers</span>
                <span className="trust-desc">Police & skill verified</span>
              </div>
            </div>

            <div className="trust-badge-item">
              <div className="trust-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="trust-badge-content">
                <span className="trust-title">Secure Bookings</span>
                <span className="trust-desc">Transparent escrow payments</span>
              </div>
            </div>

            <div className="trust-badge-item">
              <div className="trust-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="trust-badge-content">
                <span className="trust-title">Cooperative Powered</span>
                <span className="trust-desc">Democratically organized</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT COLUMN: AUTHENTICATION FORM CARD */}
      <main className="auth-card-panel">
        <div className="auth-card-container">
          {/* Mobile Only Brand Bar */}
          <div className="mobile-brand-bar">
            <div className="auth-brand-icon small">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="mobile-brand-name">Sahayog Platform</span>
          </div>

          <div className="auth-card-header">
            <h2 className="auth-card-title">{title}</h2>
            {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
          </div>

          <div className="auth-card-body">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
