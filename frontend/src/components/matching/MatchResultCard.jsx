import { useNavigate } from 'react-router-dom';
import MatchScoreBadge from './MatchScoreBadge';
import MatchFactors from './MatchFactors';
import Button from '../common/Button';

export const formatPriceUnit = (price, unit) => {
  if (price === null || price === undefined) return null;
  const numPrice = Number(price);
  const formatted = isNaN(numPrice) ? price : numPrice.toLocaleString('en-IN');

  switch (unit) {
    case 'HOURLY':
      return `₹${formatted} / hr`;
    case 'DAILY':
      return `₹${formatted} / day`;
    case 'FIXED':
    default:
      return `₹${formatted} · Fixed`;
  }
};

export const MatchResultCard = ({ match, requestId, onViewWorker }) => {
  const navigate = useNavigate();
  if (!match) return null;

  const {
    workerName,
    serviceName,
    category,
    price,
    pricingUnit,
    matchScore,
    skillMatch,
    serviceMatch,
    availabilityMatch,
    locationMatch,
    distanceKm,
  } = match;

  const priceText = formatPriceUnit(price, pricingUnit);

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '22px 24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top Header */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '10px',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {workerName || 'Verified Worker'}
            </h3>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#2563eb',
                margin: '2px 0 0',
              }}
            >
              {serviceName || 'Service Provider'}
              {category && (
                <span
                  style={{
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 400,
                    marginLeft: '8px',
                  }}
                >
                  ({category})
                </span>
              )}
            </p>
          </div>

          <MatchScoreBadge score={matchScore} />
        </div>

        {/* Pricing and Distance Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '14px',
            color: '#334155',
            marginTop: '8px',
            flexWrap: 'wrap',
          }}
        >
          {priceText && (
            <span
              style={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '15px',
                background: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '6px',
              }}
            >
              {priceText}
            </span>
          )}

          {distanceKm !== null && distanceKm !== undefined && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {Number(distanceKm).toFixed(1)} km away
            </span>
          )}
        </div>

        {/* Detailed Match Factors Grid */}
        <MatchFactors
          serviceMatch={serviceMatch}
          skillMatch={skillMatch}
          availabilityMatch={availabilityMatch}
          locationMatch={locationMatch}
          distanceKm={distanceKm}
        />
      </div>

      {/* Card Action */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Button
          variant="outline"
          size="small"
          onClick={() => {
            if (onViewWorker) {
              onViewWorker(match);
            }
          }}
          title="Worker profile preview"
        >
          View Worker
        </Button>

        <Button
          variant="primary"
          size="small"
          onClick={() => {
            const reqId = requestId || match.serviceRequestId;
            navigate(`/customer/book/${reqId}/${match.workerProfileId}/${match.workerServiceId}`);
          }}
          style={{ background: '#1e40af', color: '#ffffff' }}
        >
          Book Worker
        </Button>
      </div>
    </div>
  );
};

export default MatchResultCard;
