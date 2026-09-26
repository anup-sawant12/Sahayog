import { useState, useEffect, useCallback } from 'react';
import { getWorkerBookings } from '../../services/booking.api';
import WorkerBookingList from '../../components/bookings/WorkerBookingList';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending Requests', value: 'PENDING' },
  { label: 'Confirmed Jobs', value: 'CONFIRMED' },
  { label: 'Completed Jobs', value: 'COMPLETED' },
  { label: 'Cancelled / Rejected', value: 'CANCELLED' },
];

export const JobRequests = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = selectedStatus ? { status: selectedStatus } : undefined;
      const res = await getWorkerBookings(params);
      setBookings(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job requests.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 24px', textAlign: 'left' }}>
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
          Job Requests
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Manage service assignments requested by customers who selected your profile.
        </p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {STATUS_FILTERS.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: isActive ? '1px solid #0d9488' : '1px solid #e2e8f0',
                background: isActive ? '#f0fdfa' : '#ffffff',
                color: isActive ? '#0d9488' : '#475569',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Worker Bookings List */}
      <WorkerBookingList
        bookings={bookings}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default JobRequests;
