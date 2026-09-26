import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { createBooking } from '../../services/booking.api';

export const CreateBookingForm = ({
  serviceRequestId,
  workerProfileId,
  workerServiceId,
  initialDate = '',
  initialTime = '',
  onCancel,
}) => {
  const navigate = useNavigate();

  const todayString = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    scheduledDate: initialDate || todayString,
    scheduledTime: initialTime || '10:00',
    customerNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    // 1. Date
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    } else {
      const selected = new Date(formData.scheduledDate);
      selected.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.scheduledDate = 'Scheduled date cannot be in the past';
      }
    }

    // 2. Time
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Scheduled time is required';
    } else if (!timeRegex.test(formData.scheduledTime.trim())) {
      newErrors.scheduledTime = 'Scheduled time must be in HH:mm 24-hour format';
    }

    // 3. Customer notes
    if (formData.customerNotes && formData.customerNotes.length > 1000) {
      newErrors.customerNotes = 'Customer notes cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        serviceRequestId,
        workerProfileId,
        workerServiceId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime.trim(),
        customerNotes: formData.customerNotes.trim() || undefined,
      };

      const res = await createBooking(payload);
      const bookingId = res.data?.id;

      if (bookingId) {
        navigate(`/customer/bookings/${bookingId}`);
      } else {
        navigate('/customer/bookings');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to confirm booking. Please review your details and try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
      {serverError && (
        <div style={{ marginBottom: '20px' }}>
          <ErrorMessage message={serverError} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Input
          id="scheduledDate"
          name="scheduledDate"
          type="date"
          label="Scheduled Date"
          min={todayString}
          value={formData.scheduledDate}
          onChange={handleChange}
          error={errors.scheduledDate}
          required
          disabled={isSubmitting}
        />

        <Input
          id="scheduledTime"
          name="scheduledTime"
          type="time"
          label="Scheduled Time (24-Hour Format)"
          value={formData.scheduledTime}
          onChange={handleChange}
          error={errors.scheduledTime}
          required
          disabled={isSubmitting}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label
          htmlFor="customerNotes"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1e293b',
            marginBottom: '6px',
          }}
        >
          Customer Notes <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional instructions for worker)</span>
        </label>
        <textarea
          id="customerNotes"
          name="customerNotes"
          rows="3"
          placeholder="e.g. Please bring an extension cord; gate code is 1234..."
          value={formData.customerNotes}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={1000}
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '14px',
            fontFamily: 'inherit',
            borderRadius: '10px',
            border: errors.customerNotes ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
        {errors.customerNotes && (
          <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0' }}>
            {errors.customerNotes}
          </p>
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}
      >
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="medium"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          style={{ background: '#1e40af', color: '#ffffff' }}
        >
          {isSubmitting ? 'Creating Booking...' : 'Confirm & Book Worker'}
        </Button>
      </div>
    </form>
  );
};

export default CreateBookingForm;
