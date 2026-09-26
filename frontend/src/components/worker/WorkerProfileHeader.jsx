import { useAuth } from '../../hooks/useAuth';
import VerificationStatus from './VerificationStatus';

export const WorkerProfileHeader = ({ workerProfile, userName }) => {
  const { user } = useAuth();
  const displayName = userName || user?.name || 'Worker';

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'W';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const hasPhoto = Boolean(workerProfile?.profilePhotoUrl);

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
        {/* Profile Photo or Initials Avatar */}
        {hasPhoto ? (
          <img
            src={workerProfile.profilePhotoUrl}
            alt={displayName}
            onError={(e) => {
              // Gracefully fallback to initials if photo fails to load
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = 'flex';
              }
            }}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #0d9488',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
            }}
          />
        ) : null}

        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
            color: '#ffffff',
            display: hasPhoto ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
            flexShrink: 0,
          }}
        >
          {getInitials(displayName)}
        </div>

        {/* Worker Details */}
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {displayName}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: '#f0fdfa',
                color: '#0f766e',
                border: '1px solid #ccfbf1',
              }}
            >
              WORKER
            </span>

            {workerProfile?.verificationStatus && (
              <VerificationStatus status={workerProfile.verificationStatus} />
            )}
          </div>
        </div>
      </div>

      {workerProfile?.createdAt && (
        <div style={{ textAlign: 'right', fontSize: '13px', color: '#64748b' }}>
          <span>Registered as worker </span>
          <strong style={{ color: '#334155' }}>
            {new Date(workerProfile.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </strong>
        </div>
      )}
    </div>
  );
};

export default WorkerProfileHeader;
