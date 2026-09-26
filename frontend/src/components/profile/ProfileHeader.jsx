export const ProfileHeader = ({ user }) => {
  if (!user) return null;

  // Extract initials from user name (e.g. "Anup Sawant" -> "AS")
  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isWorker = user.role === 'WORKER';

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '28px 32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* User Avatar with Initials */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: isWorker
              ? 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: isWorker
              ? '0 4px 12px rgba(13, 148, 136, 0.25)'
              : '0 4px 12px rgba(37, 99, 235, 0.25)',
            flexShrink: 0,
          }}
        >
          {getInitials(user.name)}
        </div>

        {/* User Identity Details */}
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {user.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Role Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                background: isWorker ? '#f0fdfa' : '#eff6ff',
                color: isWorker ? '#0f766e' : '#1d4ed8',
                border: isWorker ? '1px solid #ccfbf1' : '1px solid #dbeafe',
              }}
            >
              {user.role}
            </span>

            {/* Account Status with Animated Indicator */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                background: user.status === 'ACTIVE' ? '#f0fdf4' : '#fef2f2',
                color: user.status === 'ACTIVE' ? '#166534' : '#991b1b',
                border: user.status === 'ACTIVE' ? '1px solid #bbf7d0' : '1px solid #fecaca',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: user.status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                }}
              ></span>
              {user.status === 'ACTIVE' ? 'Active Account' : user.status}
            </span>
          </div>
        </div>
      </div>

      {/* Member Joined Date */}
      {user.createdAt && (
        <div style={{ textAlign: 'right', fontSize: '13px', color: '#64748b' }}>
          <span>Member since </span>
          <strong style={{ color: '#334155' }}>
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </strong>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
