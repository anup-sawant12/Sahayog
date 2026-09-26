import Button from '../common/Button';
import VerificationStatus from './VerificationStatus';

export const WorkerProfileInfo = ({ workerProfile, onEdit }) => {
  if (!workerProfile) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* CARD 1: ABOUT & PROFESSIONAL EXPERIENCE */}
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
              Worker Profile Details
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Professional bio, trade experience, and public marketplace information
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

        {/* Bio Section */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            About You (Bio)
          </span>
          <p
            style={{
              fontSize: '15px',
              color: workerProfile.bio ? '#1e293b' : '#94a3b8',
              fontStyle: workerProfile.bio ? 'normal' : 'italic',
              marginTop: '8px',
              lineHeight: 1.6,
              background: '#f8fafc',
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}
          >
            {workerProfile.bio || 'No bio provided yet. Click "Edit Profile" to add information about your services and trade.'}
          </p>
        </div>

        {/* Experience & Photo Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Work Experience
            </span>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f766e', marginTop: '6px' }}>
              {workerProfile.experienceYears !== null && workerProfile.experienceYears !== undefined
                ? `${workerProfile.experienceYears} ${workerProfile.experienceYears === 1 ? 'Year' : 'Years'}`
                : 'Not specified'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Profile Photo URL
            </span>
            <div style={{ fontSize: '14px', color: '#1e293b', marginTop: '6px', wordBreak: 'break-all' }}>
              {workerProfile.profilePhotoUrl ? (
                <a
                  href={workerProfile.profilePhotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
                >
                  View Profile Photo
                </a>
              ) : (
                <span style={{ color: '#94a3b8' }}>None linked</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: VERIFICATION STATUS CARD */}
      <VerificationStatus status={workerProfile.verificationStatus} showCard />
    </div>
  );
};

export default WorkerProfileInfo;
