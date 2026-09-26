import { useState, useEffect } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const PRICING_UNIT_OPTIONS = [
  { value: 'FIXED', label: 'Fixed price' },
  { value: 'HOURLY', label: 'Hourly rate' },
  { value: 'DAILY', label: 'Daily rate' },
];

export const ServiceForm = ({
  isOpen = true,
  onClose,
  onCancel,
  onSubmit,
  initialData = null,
  isEditMode = false,
  isSubmitting = false,
  isLoading = false,
  serverError = null,
}) => {
  const isEdit = isEditMode || Boolean(initialData);
  const submitting = isSubmitting || isLoading;
  const handleClose = onCancel || onClose;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    pricingUnit: 'FIXED',
    durationMinutes: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});
  const [internalServerError, setInternalServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        description: initialData.description || '',
        price: initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : '',
        pricingUnit: initialData.pricingUnit || 'FIXED',
        durationMinutes:
          initialData.durationMinutes !== undefined && initialData.durationMinutes !== null
            ? String(initialData.durationMinutes)
            : '',
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        price: '',
        pricingUnit: 'FIXED',
        durationMinutes: '',
        status: 'ACTIVE',
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
      [name]: type === 'checkbox' ? (checked ? 'ACTIVE' : 'INACTIVE') : value,
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

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Service name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Service name must be at least 2 characters';
    } else if (trimmedName.length > 150) {
      newErrors.name = 'Service name cannot exceed 150 characters';
    }

    const trimmedCategory = formData.category.trim();
    if (!trimmedCategory) {
      newErrors.category = 'Category is required';
    } else if (trimmedCategory.length < 2) {
      newErrors.category = 'Category must be at least 2 characters';
    } else if (trimmedCategory.length > 100) {
      newErrors.category = 'Category cannot exceed 100 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (formData.price === '' || formData.price === null) {
      newErrors.price = 'Price is required';
    } else {
      const numPrice = Number(formData.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        newErrors.price = 'Price must be a positive number';
      } else if (numPrice > 1000000) {
        newErrors.price = 'Price cannot exceed ₹1,000,000';
      }
    }

    if (!formData.pricingUnit) {
      newErrors.pricingUnit = 'Pricing unit is required';
    }

    if (formData.durationMinutes !== '' && formData.durationMinutes !== null) {
      const mins = Number(formData.durationMinutes);
      if (isNaN(mins) || mins <= 0 || !Number.isInteger(mins)) {
        newErrors.durationMinutes = 'Duration must be a positive whole number of minutes';
      } else if (mins > 10080) {
        newErrors.durationMinutes = 'Duration cannot exceed 10,080 minutes (1 week)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInternalServerError('');

    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description.trim() ? formData.description.trim() : null,
      price: Number(formData.price),
      pricingUnit: formData.pricingUnit,
      durationMinutes:
        formData.durationMinutes !== '' && formData.durationMinutes !== null
          ? Number(formData.durationMinutes)
          : null,
      status: formData.status,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save service. Please try again.';
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
          maxWidth: '460px',
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
              {isEdit ? 'Edit Service' : 'Add Service'}
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              {isEdit ? 'Update your service details and pricing' : 'Create a service offering for your customer profile'}
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
            {/* Service Name */}
            <div>
              <label htmlFor="service-name" style={labelStyle}>
                Service Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="service-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Fan Installation"
                disabled={submitting}
                style={inputStyle(Boolean(errors.name))}
              />
              {errors.name && <span style={errorTextStyle}>{errors.name}</span>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="service-category" style={labelStyle}>
                Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="service-category"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Electrical, Plumbing, Carpentry"
                disabled={submitting}
                style={inputStyle(Boolean(errors.category))}
              />
              {errors.category && <span style={errorTextStyle}>{errors.category}</span>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="service-description" style={labelStyle}>
                Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
              </label>
              <textarea
                id="service-description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe what this service entails, materials included, etc."
                disabled={submitting}
                style={{
                  ...inputStyle(Boolean(errors.description)),
                  height: 'auto',
                  padding: '8px 10px',
                  resize: 'vertical',
                }}
              />
              {errors.description && <span style={errorTextStyle}>{errors.description}</span>}
            </div>

            {/* Price & Pricing Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <div>
                <label htmlFor="service-price" style={labelStyle}>
                  Price (₹) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '9px',
                      fontSize: '13px',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  >
                    ₹
                  </span>
                  <input
                    id="service-price"
                    type="number"
                    step="any"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="300"
                    disabled={submitting}
                    style={{
                      ...inputStyle(Boolean(errors.price)),
                      paddingLeft: '24px',
                    }}
                  />
                </div>
                {errors.price && <span style={errorTextStyle}>{errors.price}</span>}
              </div>

              <div>
                <label htmlFor="service-pricing-unit" style={labelStyle}>
                  Pricing Unit <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="service-pricing-unit"
                  name="pricingUnit"
                  value={formData.pricingUnit}
                  onChange={handleChange}
                  disabled={submitting}
                  style={inputStyle(Boolean(errors.pricingUnit))}
                >
                  {PRICING_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.pricingUnit && <span style={errorTextStyle}>{errors.pricingUnit}</span>}
              </div>
            </div>

            {/* Estimated Duration (in minutes) */}
            <div>
              <label htmlFor="service-duration" style={labelStyle}>
                Estimated Duration (minutes) <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="service-duration"
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  placeholder="e.g. 60 (for 1 hour)"
                  disabled={submitting}
                  style={inputStyle(Boolean(errors.durationMinutes))}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '9px',
                    fontSize: '11px',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                >
                  mins
                </span>
              </div>
              {errors.durationMinutes && <span style={errorTextStyle}>{errors.durationMinutes}</span>}
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
                htmlFor="service-status-toggle"
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
                    Active Service
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '1px' }}>
                    {formData.status === 'ACTIVE'
                      ? 'Service is currently available for customers to view and request.'
                      : 'Service is temporarily disabled and will not be offered.'}
                  </span>
                </div>

                <input
                  id="service-status-toggle"
                  type="checkbox"
                  name="status"
                  checked={formData.status === 'ACTIVE'}
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
                    backgroundColor: formData.status === 'ACTIVE' ? '#4f46e5' : '#cbd5e1',
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
                      left: formData.status === 'ACTIVE' ? '20px' : '2px',
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
              disabled={submitting}
              style={{ background: '#4f46e5' }}
            >
              {isEdit ? 'Save Changes' : 'Add Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
