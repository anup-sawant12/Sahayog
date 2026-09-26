import { useState, useEffect } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

/**
 * ServiceAreaForm component
 * Fully styled using standard CSS inline styles matching the platform design system.
 */
export const ServiceAreaForm = ({
  isOpen = true,
  onClose,
  onCancel,
  onSubmit,
  initialData = null,
  isEditMode = false,
  isSubmitting = false,
  isLoading = false,
  serverError = null
}) => {
  const isEdit = isEditMode || Boolean(initialData);
  const submitting = isSubmitting || isLoading;
  const handleClose = onCancel || onClose;

  const [formData, setFormData] = useState({
    city: '',
    area: '',
    pincode: '',
    latitude: '',
    longitude: '',
    serviceRadiusKm: 10,
    isPrimary: false
  });

  const [errors, setErrors] = useState({});
  const [internalServerError, setInternalServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        city: initialData.city || '',
        area: initialData.area || '',
        pincode: initialData.pincode || '',
        latitude: initialData.latitude !== null && initialData.latitude !== undefined ? String(initialData.latitude) : '',
        longitude: initialData.longitude !== null && initialData.longitude !== undefined ? String(initialData.longitude) : '',
        serviceRadiusKm: initialData.serviceRadiusKm ?? 10,
        isPrimary: Boolean(initialData.isPrimary)
      });
    } else {
      setFormData({
        city: '',
        area: '',
        pincode: '',
        latitude: '',
        longitude: '',
        serviceRadiusKm: 10,
        isPrimary: false
      });
    }
    setErrors({});
    setInternalServerError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (internalServerError) {
      setInternalServerError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    const trimmedCity = formData.city.trim();
    if (!trimmedCity) {
      newErrors.city = 'City is required';
    }

    const trimmedArea = formData.area.trim();
    if (!trimmedArea) {
      newErrors.area = 'Area / Locality is required';
    }

    const trimmedPincode = formData.pincode.trim();
    if (!trimmedPincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(trimmedPincode)) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    if (formData.latitude !== '' && formData.latitude !== null) {
      const latNum = parseFloat(formData.latitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
    }

    if (formData.longitude !== '' && formData.longitude !== null) {
      const lngNum = parseFloat(formData.longitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
    }

    const radius = Number(formData.serviceRadiusKm);
    if (isNaN(radius) || radius < 1 || radius > 100) {
      newErrors.serviceRadiusKm = 'Service radius must be between 1 and 100 km';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInternalServerError('');

    if (!validate()) return;

    const payload = {
      city: formData.city.trim(),
      area: formData.area.trim(),
      pincode: formData.pincode.trim(),
      serviceRadiusKm: Number(formData.serviceRadiusKm),
      isPrimary: Boolean(formData.isPrimary)
    };

    if (formData.latitude !== '' && formData.latitude !== null) {
      payload.latitude = parseFloat(formData.latitude);
    } else {
      payload.latitude = null;
    }

    if (formData.longitude !== '' && formData.longitude !== null) {
      payload.longitude = parseFloat(formData.longitude);
    } else {
      payload.longitude = null;
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save service area. Please try again.';
      setInternalServerError(msg);
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

  const activeError = serverError || internalServerError;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && handleClose && !submitting) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          padding: '20px',
          animation: 'slideUp 0.2s ease-out',
          maxHeight: '90vh',
          overflowY: 'auto',
          textAlign: 'left',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
              {isEdit ? 'Edit Service Area' : 'Add Service Area'}
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              {isEdit ? 'Update your coverage details for this location' : 'Specify where you are willing to deliver services'}
            </p>
          </div>

          {handleClose && (
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              aria-label="Close modal"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '2px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Server Error Alert */}
        {activeError && (
          <div style={{ marginBottom: '14px' }}>
            <ErrorMessage message={activeError} onDismiss={() => setInternalServerError('')} />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* City */}
            <div>
              <label htmlFor="sa-city" style={labelStyle}>
                City <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="sa-city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                disabled={submitting}
                style={inputStyle(Boolean(errors.city))}
              />
              {errors.city && <span style={errorTextStyle}>{errors.city}</span>}
            </div>

            {/* Area / Locality */}
            <div>
              <label htmlFor="sa-area" style={labelStyle}>
                Area / Locality <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="sa-area"
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g. Andheri West"
                disabled={submitting}
                style={inputStyle(Boolean(errors.area))}
              />
              {errors.area && <span style={errorTextStyle}>{errors.area}</span>}
            </div>

            {/* Pincode & Service Radius Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <div>
                <label htmlFor="sa-pincode" style={labelStyle}>
                  Pincode <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="sa-pincode"
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 400053"
                  disabled={submitting}
                  style={inputStyle(Boolean(errors.pincode))}
                />
                {errors.pincode && <span style={errorTextStyle}>{errors.pincode}</span>}
              </div>

              <div>
                <label htmlFor="sa-radius" style={labelStyle}>
                  Service Radius (km) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="sa-radius"
                  type="number"
                  name="serviceRadiusKm"
                  min="1"
                  max="100"
                  value={formData.serviceRadiusKm}
                  onChange={handleChange}
                  placeholder="10"
                  disabled={submitting}
                  style={inputStyle(Boolean(errors.serviceRadiusKm))}
                />
                {errors.serviceRadiusKm && <span style={errorTextStyle}>{errors.serviceRadiusKm}</span>}
              </div>
            </div>

            {/* Coordinates (Optional) */}
            <div
              style={{
                padding: '10px 12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Coordinates (Optional)
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Manual entry</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <div>
                  <label htmlFor="sa-latitude" style={{ ...labelStyle, fontSize: '11px', marginBottom: '2px', color: '#64748b' }}>
                    Latitude (-90 to 90)
                  </label>
                  <input
                    id="sa-latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 19.1136"
                    disabled={submitting}
                    style={inputStyle(Boolean(errors.latitude))}
                  />
                  {errors.latitude && <span style={errorTextStyle}>{errors.latitude}</span>}
                </div>

                <div>
                  <label htmlFor="sa-longitude" style={{ ...labelStyle, fontSize: '11px', marginBottom: '2px', color: '#64748b' }}>
                    Longitude (-180 to 180)
                  </label>
                  <input
                    id="sa-longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 72.8697"
                    disabled={submitting}
                    style={inputStyle(Boolean(errors.longitude))}
                  />
                  {errors.longitude && <span style={errorTextStyle}>{errors.longitude}</span>}
                </div>
              </div>
            </div>

            {/* Primary Service Area Checkbox */}
            <div
              style={{
                padding: '10px 12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <label
                htmlFor="sa-primary-toggle"
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
                    Set as Primary Service Area
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '1px' }}>
                    Highlight this location as your main base of operations.
                  </span>
                </div>

                <input
                  id="sa-primary-toggle"
                  type="checkbox"
                  name="isPrimary"
                  checked={formData.isPrimary}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{ display: 'none' }}
                />

                <span
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '38px',
                    height: '20px',
                    backgroundColor: formData.isPrimary ? '#4f46e5' : '#cbd5e1',
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
                      left: formData.isPrimary ? '20px' : '2px',
                      width: '16px',
                      height: '16px',
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
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            {handleClose && (
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="small"
              isLoading={submitting}
              style={{ background: '#4f46e5' }}
            >
              {isEdit ? 'Update Service Area' : 'Add Service Area'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceAreaForm;
