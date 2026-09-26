import CertificationCard from './CertificationCard';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';

export const CertificationList = ({
  certifications = [],
  isLoading = false,
  error = '',
  onRetry,
  onOpenAddModal,
  onEditCertification,
  onDeleteCertification,
}) => {
  if (isLoading) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Loader size="large" color="#0d9488" />
        <p style={{ marginTop: '16px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
          Loading your certifications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '40px 24px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <ErrorMessage message={error} />
        {onRetry && (
          <div style={{ marginTop: '16px' }}>
            <Button variant="outline" size="small" onClick={onRetry}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (certifications.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1.5px dashed #cbd5e1',
          padding: '56px 28px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
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
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
          No certifications added yet
        </h3>

        <p style={{ maxWidth: '440px', margin: '0 auto 24px', color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
          Add your professional certifications to strengthen your worker profile, verify your expertise, and build trust with customers.
        </p>

        <Button
          type="button"
          variant="primary"
          size="medium"
          onClick={onOpenAddModal}
          style={{ background: '#0d9488' }}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Certification
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}
    >
      {certifications.map((cert) => (
        <CertificationCard
          key={cert.id}
          certification={cert}
          onEdit={onEditCertification}
          onDelete={onDeleteCertification}
        />
      ))}
    </div>
  );
};

export default CertificationList;
