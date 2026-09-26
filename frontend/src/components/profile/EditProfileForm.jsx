import { useState } from 'react';
import userApi from '../../services/user.api';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

export const EditProfileForm = ({ user, onSaveSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const errors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      errors.name = 'Full name is required';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      errors.name = 'Name must not exceed 100 characters';
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Build diff payload with only changed fields
    const payload = {};
    if (formData.name.trim() !== user.name) {
      payload.name = formData.name.trim();
    }
    if (formData.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      payload.email = formData.email.trim().toLowerCase();
    }
    if (formData.phone.trim() !== user.phone) {
      payload.phone = formData.phone.trim();
    }

    // Prevent submission if nothing changed
    if (Object.keys(payload).length === 0) {
      onCancel();
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await userApi.updateMyProfile(payload);
      if (res.success && res.data?.user) {
        onSaveSuccess(res.data.user);
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const apiMessage =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'An account with this email or phone number already exists'
          : null) ||
        'Failed to update profile. Please verify your details.';

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const mappedErrors = {};
        apiErrors.forEach((issue) => {
          if (issue.field) mappedErrors[issue.field] = issue.message;
        });
        setFieldErrors(mappedErrors);
      }

      setServerError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '28px 32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
          Edit Personal Information
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Update your public profile and contact preferences
        </p>
      </div>

      <ErrorMessage message={serverError} onDismiss={() => setServerError('')} />

      <form onSubmit={handleSubmit} noValidate>
        <Input
          id="edit-name"
          name="name"
          type="text"
          label="Full Name"
          value={formData.name}
          onChange={handleChange}
          error={fieldErrors.name}
          disabled={isSubmitting}
          required
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        <Input
          id="edit-email"
          name="email"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
          disabled={isSubmitting}
          required
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          }
        />

        <Input
          id="edit-phone"
          name="phone"
          type="tel"
          label="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          error={fieldErrors.phone}
          disabled={isSubmitting}
          required
          helperText="10-digit Indian mobile number without prefix"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          }
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="medium"
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;
