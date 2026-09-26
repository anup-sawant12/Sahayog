import CertificationStatus from './CertificationStatus';
import Button from '../common/Button';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const exp = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return exp.getTime() < today.getTime();
};

export const CertificationCard = ({ certification, onEdit, onDelete }) => {
  const expired = isExpired(certification?.expiryDate);

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        textAlign: 'left',
      }}
    >
      <div>
        {/* Card Header: Icon, Name & Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#f0fdfa',
                border: '1px solid #ccfbf1',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <div>
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {certification.name}
              </h3>
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: 500,
                }}
              >
                {certification.issuingOrganization}
              </p>
            </div>
          </div>

          <CertificationStatus status={certification.verificationStatus} />
        </div>

        {/* Certificate Details */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '14px 16px',
            margin: '16px 0',
            border: '1px solid #f1f5f9',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          {certification.certificateNumber && (
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Certificate No.
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>
                {certification.certificateNumber}
              </p>
            </div>
          )}

          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Issue Date
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
              {formatDate(certification.issueDate)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Validity
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 500 }}>
              {certification.expiryDate ? (
                expired ? (
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>
                    Expired ({formatDate(certification.expiryDate)})
                  </span>
                ) : (
                  <span style={{ color: '#334155' }}>
                    Expires: {formatDate(certification.expiryDate)}
                  </span>
                )
              ) : (
                <span style={{ color: '#059669', fontWeight: 600 }}>
                  Does not expire
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Document Link (if available) */}
        {certification.documentUrl && (
          <div style={{ marginBottom: '16px' }}>
            <a
              href={certification.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              View Certificate Document
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Card Actions: Edit & Delete */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="small"
          onClick={() => onEdit(certification)}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          }
        >
          Edit
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={() => onDelete(certification)}
          style={{ color: '#dc2626' }}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          }
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default CertificationCard;
