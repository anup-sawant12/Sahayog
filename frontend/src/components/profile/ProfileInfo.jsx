import Button from '../common/Button';

export const ProfileInfo = ({ user, onEdit }) => {
  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* CARD 1: PERSONAL INFORMATION */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px 32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Personal Information
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Primary contact information and identity details
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={onEdit}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            }
          >
            Edit Profile
          </Button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Full Name */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Full Name
            </span>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginTop: '6px' }}>
              {user.name}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email Address
            </span>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginTop: '6px' }}>
              {user.email}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Phone Number
            </span>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginTop: '6px' }}>
              +91 {user.phone}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: ACCOUNT INFORMATION */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px 32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Account Details & Security
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Marketplace role, access privileges, and verification status
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Role */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform Role
            </span>
            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: user.role === 'WORKER' ? '#0f766e' : '#1d4ed8',
                  background: user.role === 'WORKER' ? '#f0fdfa' : '#eff6ff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: user.role === 'WORKER' ? '1px solid #ccfbf1' : '1px solid #dbeafe',
                }}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Account Status
            </span>
            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#166534',
                  background: '#f0fdf4',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                {user.status}
              </span>
            </div>
          </div>

          {/* Email Verification */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email Verification
            </span>
            <div style={{ marginTop: '6px' }}>
              {user.emailVerified ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#166534',
                    background: '#f0fdf4',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  ✓ Verified
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#b45309',
                    background: '#fffbeb',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #fef3c7',
                  }}
                >
                  Pending verification
                </span>
              )}
            </div>
          </div>

          {/* Phone Verification */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Phone Verification
            </span>
            <div style={{ marginTop: '6px' }}>
              {user.phoneVerified ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#166534',
                    background: '#f0fdf4',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  ✓ Verified
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#b45309',
                    background: '#fffbeb',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #fef3c7',
                  }}
                >
                  Pending verification
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
