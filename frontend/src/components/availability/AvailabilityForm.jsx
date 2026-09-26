import { useState } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const DAYS_OPTIONS = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

export const AvailabilityForm = ({
  initialData = null,
  preselectedDay = 'MONDAY',
  isEditMode = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    dayOfWeek: initialData?.dayOfWeek || preselectedDay || 'MONDAY',
    startTime: initialData?.startTime || '09:00',
    endTime: initialData?.endTime || '17:00',
    isAvailable: initialData ? initialData.isAvailable !== false : true,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.dayOfWeek) {
      newErrors.dayOfWeek = 'Day of the week is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.startTime = 'Start time must be earlier than end time';
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    const payload = {
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      isAvailable: formData.isAvailable,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'An availability slot with this exact day and time already exists.'
          : null) ||
        'Failed to save availability slot. Please try again.';
      setServerError(msg);
    }
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '4px',
    textAlign: 'left',
  };

  const errorTextStyle = {
    fontSize: '11px',
    color: '#dc2626',
    marginTop: '3px',
    textAlign: 'left',
    display: 'block',
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '36px',
    padding: '0 10px',
    fontSize: '13px',
    fontFamily: 'inherit',
    borderRadius: '8px',
    border: `1px solid ${hasError ? '#ef4444' : '#cbd5e1'}`,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#0f172a',
    transition: 'border-color 0.15s ease',
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorMessage message={serverError} onDismiss={() => setServerError('')} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Day of Week */}
        <div>
          <label htmlFor="avail-day" style={labelStyle}>
            Day of Week <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            id="avail-day"
            name="dayOfWeek"
            value={formData.dayOfWeek}
            onChange={handleChange}
            disabled={isSubmitting}
            style={inputStyle(Boolean(errors.dayOfWeek))}
          >
            {DAYS_OPTIONS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          {errors.dayOfWeek && <span style={errorTextStyle}>{errors.dayOfWeek}</span>}
        </div>

        {/* Start Time & End Time */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <div>
            <label htmlFor="avail-start-time" style={labelStyle}>
              Start Time <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="avail-start-time"
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              disabled={isSubmitting}
              style={inputStyle(Boolean(errors.startTime))}
            />
            {errors.startTime && <span style={errorTextStyle}>{errors.startTime}</span>}
          </div>

          <div>
            <label htmlFor="avail-end-time" style={labelStyle}>
              End Time <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="avail-end-time"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              disabled={isSubmitting}
              style={inputStyle(Boolean(errors.endTime))}
            />
            {errors.endTime && <span style={errorTextStyle}>{errors.endTime}</span>}
          </div>
        </div>

        {/* Status Toggle */}
        <div
          style={{
            padding: '10px 12px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <label
            htmlFor="avail-status-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              margin: 0,
            }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'block' }}>
                Available for Work
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '1px' }}>
                {formData.isAvailable
                  ? 'Accepting service requests during these hours'
                  : 'Blocked / Unavailable during these hours'}
              </span>
            </div>

            <input
              id="avail-status-toggle"
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              disabled={isSubmitting}
              style={{ display: 'none' }}
            />

            <span
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '40px',
                height: '22px',
                backgroundColor: formData.isAvailable ? '#0d9488' : '#cbd5e1',
                borderRadius: '9999px',
                transition: 'background-color 0.2s',
                flexShrink: 0,
                marginLeft: '12px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: formData.isAvailable ? '20px' : '2px',
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
                }}
              />
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          marginTop: '20px',
          paddingTop: '14px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="small"
          isLoading={isSubmitting}
          style={{ background: '#0d9488' }}
        >
          {isEditMode ? 'Save Changes' : 'Add Availability'}
        </Button>
      </div>
    </form>
  );
};

export default AvailabilityForm;
