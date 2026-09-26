import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getServiceRequest } from '../../services/matching.api';
import CreateBookingForm from '../../components/bookings/CreateBookingForm';
import MatchScoreBadge from '../../components/matching/MatchScoreBadge';
import { formatDate, formatTime12h, formatPriceUnit } from '../../components/bookings/BookingCard';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';

export const BookWorker = () => {
  const { requestId, workerProfileId, workerServiceId } = useParams();

  const [request, setRequest] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getServiceRequest(requestId);
        if (res.data) {
          setRequest(res.data.request);

          // Find the selected worker from matches
          const match = (res.data.matches || []).find(
            (m) =>
              m.workerProfileId === workerProfileId &&
              (!workerServiceId || m.workerServiceId === workerServiceId)
          );
          setSelectedMatch(match || null);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking request details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [requestId, workerProfileId, workerServiceId]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: 860, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <Loader size="large" />
        <p style={{ marginTop: '16px', color: '#1e40af', fontWeight: 600 }}>
          Loading service and worker details...
        </p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div style={{ maxWidth: 860, margin: '50px auto', padding: '0 24px', textAlign: 'left' }}>
        <ErrorMessage message={error || 'Service request could not be loaded.'} />
        <div style={{ marginTop: '20px' }}>
          <Link to={`/customer/matches/${requestId}`} style={{ color: '#2563eb', fontWeight: 600 }}>
            &larr; Back to Matched Workers
          </Link>
        </div>
      </div>
    );
  }

  const initialDate = request.requestedDate
    ? new Date(request.requestedDate).toISOString().split('T')[0]
    : '';
  const initialTime = request.requestedTime || '10:00';
  const priceDisplay = selectedMatch
    ? formatPriceUnit(selectedMatch.price, selectedMatch.pricingUnit)
    : null;

  return (
    <div style={{ maxWidth: 880, margin: '40px auto', padding: '0 24px', textAlign: 'left' }}>
      {/* Back Link */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={`/customer/matches/${requestId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Matching Results
        </Link>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Book Verified Worker
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Review the selected worker and finalize the schedule for your service booking.
        </p>
      </div>

      {/* Worker & Service Selection Summary Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '16px',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Selected Provider
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
              {selectedMatch?.workerName || 'Verified Worker'}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '14.5px', color: '#2563eb', fontWeight: 500 }}>
              {selectedMatch?.serviceName || request.serviceName}
              {selectedMatch?.category && ` (${selectedMatch.category})`}
            </p>
          </div>

          {selectedMatch?.matchScore && (
            <MatchScoreBadge score={selectedMatch.matchScore} />
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Service Price
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 800, color: '#0f172a', fontSize: '18px' }}>
              {priceDisplay || 'Fixed Price'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Service Location
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b', fontSize: '14.5px' }}>
              {request.area}, {request.city} {request.pincode ? `(${request.pincode})` : ''}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Initial Request Time
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b', fontSize: '14.5px' }}>
              {formatDate(request.requestedDate)} at {formatTime12h(request.requestedTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Form Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px 32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
          Confirm Schedule & Instructions
        </h2>

        <CreateBookingForm
          serviceRequestId={requestId}
          workerProfileId={workerProfileId}
          workerServiceId={workerServiceId}
          initialDate={initialDate}
          initialTime={initialTime}
          onCancel={() => window.history.back()}
        />
      </div>
    </div>
  );
};

export default BookWorker;
