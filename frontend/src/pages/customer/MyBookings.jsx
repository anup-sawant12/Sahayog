import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerBookings } from '../../services/booking.api';
import CustomerBookingList from '../../components/bookings/CustomerBookingList';
import Button from '../../components/common/Button';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export const MyBookings = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = selectedStatus ? { status: selectedStatus } : undefined;
      const res = await getCustomerBookings(params);
      setBookings(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your bookings.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 24px', textAlign: 'left' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            My Bookings
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
            Track, manage, and view the progress of your scheduled service requests.
          </p>
        </div>

        <Link to="/customer/request-service" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="medium">
            Request a Service
          </Button>
        </Link>
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
                border: isActive ? '1px solid #1e40af' : '1px solid #e2e8f0',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#1e40af' : '#475569',
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

      {/* Bookings List */}
      <CustomerBookingList
        bookings={bookings}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default MyBookings;
