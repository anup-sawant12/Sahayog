import BookingList from './BookingList';

export const WorkerBookingList = ({
  bookings = [],
  isLoading = false,
  error = null,
  onViewDetails,
}) => {
  return (
    <BookingList
      bookings={bookings}
      isLoading={isLoading}
      error={error}
      isWorker={true}
      emptyTitle="No job requests yet"
      emptyMessage="New customer bookings will appear here."
      onViewDetails={onViewDetails}
    />
  );
};

export default WorkerBookingList;
