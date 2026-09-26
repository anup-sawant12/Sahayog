import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { createServiceRequest } from '../../services/matching.api';

const COMMON_CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Cleaning',
  'Appliance Repair',
  'Painting',
  'Masonry',
  'Pest Control',
];

export const ServiceRequestForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read prefilled values from navigation state if available
  const prefilledCategory = location.state?.category || '';
  const prefilledServiceName = location.state?.serviceName || '';

  // Today in YYYY-MM-DD for min date constraint
  const todayString = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    serviceName: prefilledServiceName,
    category: prefilledCategory,
    description: '',
    requestedDate: todayString,
    requestedTime: '10:00',
    city: '',
    area: '',
    pincode: '',
    latitude: '',
    longitude: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    // 1. Service Name
    if (!formData.serviceName || !formData.serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    } else if (formData.serviceName.trim().length < 2) {
      newErrors.serviceName = 'Service name must be at least 2 characters';
    }

    // 2. Category
    if (!formData.category || !formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    // 3. Requested Date
    if (!formData.requestedDate) {
      newErrors.requestedDate = 'Requested date is required';
    } else {
      const selectedDate = new Date(formData.requestedDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.requestedDate = 'Requested date cannot be in the past';
      }
    }

    // 4. Requested Time
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!formData.requestedTime) {
      newErrors.requestedTime = 'Requested time is required';
    } else if (!timeRegex.test(formData.requestedTime.trim())) {
      newErrors.requestedTime = 'Requested time must be in HH:mm 24-hour format';
    }

    // 5. City
    if (!formData.city || !formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // 6. Area
    if (!formData.area || !formData.area.trim()) {
      newErrors.area = 'Area / Locality is required';
    }

    // 7. Pincode
    const pincodeRegex = /^[1-9]\d{5}$/;
    if (!formData.pincode || !formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!pincodeRegex.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    // 8. Coordinates
    const hasLat = formData.latitude !== '' && formData.latitude !== null;
    const hasLng = formData.longitude !== '' && formData.longitude !== null;

    if (hasLat && !hasLng) {
      newErrors.longitude = 'Longitude is required when latitude is provided';
    } else if (!hasLat && hasLng) {
      newErrors.latitude = 'Latitude is required when longitude is provided';
    } else if (hasLat && hasLng) {
      const latNum = Number(formData.latitude);
      const lngNum = Number(formData.longitude);

      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
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
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleCategorySelect = (cat) => {
    setFormData((prev) => ({
      ...prev,
      category: cat,
    }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: null }));
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
        serviceName: formData.serviceName.trim(),
        category: formData.category.trim(),
        description: formData.description?.trim() || null,
        requestedDate: formData.requestedDate,
        requestedTime: formData.requestedTime.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        pincode: formData.pincode.trim(),
        latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
        longitude: formData.longitude !== '' ? Number(formData.longitude) : null,
      };

      const response = await createServiceRequest(payload);
      const requestId = response.data?.request?.id;

      if (requestId) {
        navigate(`/customer/matches/${requestId}`);
      } else {
        setServerError('Service request was created, but request ID was not returned.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to create service request and generate matches. Please check your details and try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '28px 32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        textAlign: 'left',
      }}
    >
      {serverError && (
        <div style={{ marginBottom: '20px' }}>
          <ErrorMessage message={serverError} />
        </div>
      )}

      {/* Section 1: Service Details */}
      <div style={{ marginBottom: '28px' }}>
        <h2
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}
          >
            1
          </span>
          Service Information
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <Input
            id="serviceName"
            name="serviceName"
            label="Service Name"
            placeholder="e.g. Fan Installation, Tap Leak Repair"
            value={formData.serviceName}
            onChange={handleChange}
            error={errors.serviceName}
            required
            disabled={isSubmitting}
          />

          <div>
            <Input
              id="category"
              name="category"
              label="Category"
              placeholder="e.g. Electrical, Plumbing"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              required
              disabled={isSubmitting}
            />
            {/* Quick Category Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '-10px', marginBottom: '16px' }}>
              {COMMON_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  disabled={isSubmitting}
                  style={{
                    padding: '3px 8px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: formData.category === cat ? '#eff6ff' : '#f8fafc',
                    color: formData.category === cat ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                    fontWeight: formData.category === cat ? 600 : 400,
                    transition: 'all 0.1s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '18px' }}>
          <label
            htmlFor="description"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '6px',
            }}
          >
            Description <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            placeholder="Provide any specific details or special instructions for the service..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '14px',
              fontFamily: 'inherit',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>
      </div>

      {/* Section 2: Date & Time */}
      <div style={{ marginBottom: '28px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
        <h2
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}
          >
            2
          </span>
          Schedule & Timing
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <Input
            id="requestedDate"
            name="requestedDate"
            type="date"
            label="Requested Date"
            min={todayString}
            value={formData.requestedDate}
            onChange={handleChange}
            error={errors.requestedDate}
            required
            disabled={isSubmitting}
          />

          <Input
            id="requestedTime"
            name="requestedTime"
            type="time"
            label="Requested Time (24-Hour Format)"
            value={formData.requestedTime}
            onChange={handleChange}
            error={errors.requestedTime}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Section 3: Location */}
      <div style={{ marginBottom: '28px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
        <h2
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}
          >
            3
          </span>
          Service Location
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <Input
            id="city"
            name="city"
            label="City"
            placeholder="e.g. Mumbai"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            required
            disabled={isSubmitting}
          />

          <Input
            id="area"
            name="area"
            label="Area / Locality"
            placeholder="e.g. Andheri East"
            value={formData.area}
            onChange={handleChange}
            error={errors.area}
            required
            disabled={isSubmitting}
          />

          <Input
            id="pincode"
            name="pincode"
            label="Pincode"
            placeholder="e.g. 400053"
            value={formData.pincode}
            onChange={handleChange}
            error={errors.pincode}
            maxLength={6}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Optional Coordinates */}
        <div style={{ marginTop: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
            GPS Coordinates <span style={{ fontWeight: 400, color: '#64748b' }}>(Optional - for distance calculation)</span>
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              label="Latitude"
              placeholder="e.g. 19.1197"
              value={formData.latitude}
              onChange={handleChange}
              error={errors.latitude}
              disabled={isSubmitting}
            />

            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              label="Longitude"
              placeholder="e.g. 72.8468"
              value={formData.longitude}
              onChange={handleChange}
              error={errors.longitude}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Form Submission */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Button
          type="button"
          variant="secondary"
          size="medium"
          onClick={() => navigate('/customer/dashboard')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="medium"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Finding Workers...' : 'Find Workers'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceRequestForm;
