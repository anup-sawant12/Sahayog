import { useNavigate } from 'react-router-dom';
import BookingList from './BookingList';
import Button from '../common/Button';

export const CustomerBookingList = ({
  bookings = [],
  isLoading = false,
  error = null,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  const emptyAction = (
    <Button
      variant="primary"
      size="medium"
      onClick={() => navigate('/customer/request-service')}
    >
      Request a Service
    </Button>
  );

  return (
    <BookingList
      bookings={bookings}
      isLoading={isLoading}
      error={error}
      isWorker={false}
      emptyTitle="No bookings yet"
      emptyMessage="Your service bookings will appear here."
      emptyAction={emptyAction}
      onViewDetails={onViewDetails}
    />
  );
};

export default CustomerBookingList;
