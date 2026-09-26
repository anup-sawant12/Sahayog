import { useNavigate } from 'react-router-dom';
import MatchResultCard from './MatchResultCard';
import Loader from '../common/Loader';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

export const MatchResultList = ({
  matches = [],
  requestId = null,
  isLoading = false,
  error = null,
  onViewWorker,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}
      >
        <Loader size="large" />
        <p
          style={{
            marginTop: '16px',
            fontSize: '15px',
            fontWeight: 600,
            color: '#1e40af',
          }}
        >
          Evaluating worker availability, location, and services...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ margin: '20px 0' }}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '50px 24px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#64748b',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>

        <h3
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 8px',
          }}
        >
          No matching workers found
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
            maxWidth: '440px',
            margin: '0 auto 24px',
            lineHeight: 1.5,
          }}
        >
          We couldn't find a worker matching all the requested requirements.
        </p>

        <Button
          variant="primary"
          size="medium"
          onClick={() => navigate('/customer/request-service')}
        >
          Try Again
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
      {/* Retain exact ranking order from backend */}
      {matches.map((match) => (
        <MatchResultCard
          key={match.id || `${match.workerProfileId}-${match.workerServiceId}`}
          match={match}
          requestId={requestId}
          onViewWorker={onViewWorker}
        />
      ))}
    </div>
  );
};

export default MatchResultList;
