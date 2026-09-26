import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getServiceRequest } from '../../services/matching.api';
import MatchResultList from '../../components/matching/MatchResultList';
import RematchButton from '../../components/matching/RematchButton';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatTime12h = (timeStr) => {
  if (!timeStr) return 'N/A';
  try {
    const [hStr, mStr] = timeStr.split(':');
    const hour = parseInt(hStr, 10);
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${mStr} ${ampm}`;
  } catch {
    return timeStr;
  }
};

export const MatchResults = () => {
  const { id: requestId } = useParams();

  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rematchNotice, setRematchNotice] = useState(null);
  const [selectedWorkerPreview, setSelectedWorkerPreview] = useState(null);

  const fetchMatches = useCallback(async () => {
    if (!requestId) return;

    try {
      setIsLoading(true);
      setError(null);
      const res = await getServiceRequest(requestId);
      if (res.data) {
        setRequest(res.data.request);
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 401) {
        setError('Your session has expired. Please sign in again.');
      } else if (status === 403) {
        setError('Access denied. You can only view your own service requests.');
      } else if (status === 404) {
        setError('The requested service request was not found.');
      } else {
        setError(msg || 'Failed to load matching workers. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleRematchSuccess = (data) => {
    if (data) {
      if (data.request) setRequest(data.request);
      if (data.matches) setMatches(data.matches);
      setRematchNotice('Matches updated with the latest worker availability and status.');
      setTimeout(() => setRematchNotice(null), 5000);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'MATCHED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#059669',
              }}
            />
            Workers Found
          </span>
        );
      case 'OPEN':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#d97706',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#d97706',
              }}
            />
            Searching
          </span>
        );
      case 'COMPLETED':
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Cancelled
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {status || 'Unknown'}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 960, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <Loader size="large" />
        <p style={{ marginTop: '20px', color: '#1e40af', fontWeight: 600, fontSize: '16px' }}>
          Finding suitable workers for your request...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 860, margin: '50px auto', padding: '0 24px', textAlign: 'left' }}>
        <div style={{ marginBottom: '20px' }}>
          <Link
            to="/customer/dashboard"
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
            Back to Dashboard
          </Link>
        </div>
        <ErrorMessage message={error} />
        <div style={{ marginTop: '20px' }}>
          <Button variant="primary" onClick={() => fetchMatches()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: '40px auto', padding: '0 24px', textAlign: 'left' }}>
      {/* Top Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Link
          to="/customer/dashboard"
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
          Back to Dashboard
        </Link>

        {request && (request.status === 'OPEN' || request.status === 'MATCHED') && (
          <RematchButton
            requestId={request.id}
            status={request.status}
            onRematchSuccess={handleRematchSuccess}
            onError={(msg) => setError(msg)}
          />
        )}
      </div>

      {/* Rematch Notification Banner */}
      {rematchNotice && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {rematchNotice}
        </div>
      )}

      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Workers Available for Your Request
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Deterministic matching results ranked by service accuracy, worker skills, schedule coverage, and location proximity.
        </p>
      </div>

      {/* Request Summary Card */}
      {request && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px 28px',
            marginBottom: '36px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid #f1f5f9',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Service Request Summary
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                {request.serviceName}
                {request.category && (
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginLeft: '8px' }}>
                    · {request.category}
                  </span>
                )}
              </h2>
            </div>
            {renderStatusBadge(request.status)}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Requested Date
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b', fontSize: '14.5px' }}>
                {formatDate(request.requestedDate)}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Requested Time
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b', fontSize: '14.5px' }}>
                {formatTime12h(request.requestedTime)}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Location
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b', fontSize: '14.5px' }}>
                {request.area}, {request.city} {request.pincode ? `(${request.pincode})` : ''}
              </p>
            </div>
          </div>

          {request.description && (
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f8fafc' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Customer Notes
              </span>
              <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '13.5px', lineHeight: 1.5 }}>
                {request.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommended Workers Section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
            }}
          >
            Recommended Workers
          </h2>
          {matches.length > 0 && (
            <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 500 }}>
              {matches.length} {matches.length === 1 ? 'candidate found' : 'candidates found'}
            </span>
          )}
        </div>

        <MatchResultList
          matches={matches}
          requestId={request?.id || requestId}
          isLoading={false}
          error={null}
          onViewWorker={(worker) => setSelectedWorkerPreview(worker)}
        />
      </div>

      {/* Worker Preview Modal */}
      {selectedWorkerPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedWorkerPreview(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              textAlign: 'left',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Worker Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedWorkerPreview(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '20px',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a' }}>
                {selectedWorkerPreview.workerName}
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#2563eb', fontWeight: 500 }}>
                {selectedWorkerPreview.serviceName} ({selectedWorkerPreview.category})
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                Match score: <strong>{selectedWorkerPreview.matchScore}%</strong>
              </p>
            </div>

            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Proceed to schedule and book this verified professional for your service request.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" size="small" onClick={() => setSelectedWorkerPreview(null)}>
                Close
              </Button>

              <Link
                to={`/customer/book/${request?.id || requestId}/${selectedWorkerPreview.workerProfileId}/${selectedWorkerPreview.workerServiceId}`}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="primary" size="small" style={{ background: '#1e40af', color: '#ffffff' }}>
                  Book Worker
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchResults;
