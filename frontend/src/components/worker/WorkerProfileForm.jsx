import { useState } from 'react';
import workerApi from '../../services/worker.api';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

export const WorkerProfileForm = ({
  initialData = null,
  isCreating = false,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    bio: initialData?.bio || '',
    experienceYears:
      initialData?.experienceYears !== null && initialData?.experienceYears !== undefined
        ? String(initialData.experienceYears)
        : '',
    profilePhotoUrl: initialData?.profilePhotoUrl || '',
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

    if (formData.bio && formData.bio.trim().length > 1000) {
      errors.bio = 'Bio cannot exceed 1000 characters';
    }

    if (formData.experienceYears !== '') {
      const expNum = Number(formData.experienceYears);
      if (isNaN(expNum) || !Number.isInteger(expNum)) {
        errors.experienceYears = 'Experience must be a whole number';
      } else if (expNum < 0) {
        errors.experienceYears = 'Experience cannot be negative';
      } else if (expNum > 60) {
        errors.experienceYears = 'Experience cannot exceed 60 years';
      }
    }

    if (formData.profilePhotoUrl && formData.profilePhotoUrl.trim()) {
      try {
        new URL(formData.profilePhotoUrl.trim());
      } catch {
        errors.profilePhotoUrl = 'Please enter a valid URL (e.g. https://example.com/photo.jpg)';
      }
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

    const payload = {};
    if (formData.bio.trim()) {
      payload.bio = formData.bio.trim();
    } else if (!isCreating && initialData?.bio) {
      payload.bio = '';
    }

    if (formData.experienceYears !== '') {
      payload.experienceYears = parseInt(formData.experienceYears, 10);
    }

    if (formData.profilePhotoUrl.trim()) {
      payload.profilePhotoUrl = formData.profilePhotoUrl.trim();
    } else if (!isCreating && initialData?.profilePhotoUrl) {
      payload.profilePhotoUrl = '';
    }

    // In edit mode, prevent submission if nothing changed
    if (!isCreating) {
      const isBioSame = (payload.bio || '') === (initialData?.bio || '');
      const isExpSame = (payload.experienceYears ?? null) === (initialData?.experienceYears ?? null);
      const isPhotoSame = (payload.profilePhotoUrl || '') === (initialData?.profilePhotoUrl || '');

      if (isBioSame && isExpSame && isPhotoSame) {
        onCancel();
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let res;
      if (isCreating) {
        res = await workerApi.createWorkerProfile(payload);
      } else {
        res = await workerApi.updateWorkerProfile(payload);
      }

      if (res.success && res.data?.workerProfile) {
        onSuccess(res.data.workerProfile);
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const apiMessage =
        err.response?.data?.message ||
        (err.response?.status === 409 ? 'Worker profile already exists' : null) ||
        (err.response?.status === 403 ? 'Only workers are authorized to perform this action' : null) ||
        'Failed to save worker profile. Please verify your details.';

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
          {isCreating ? 'Create Worker Profile' : 'Edit Worker Profile'}
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          {isCreating
            ? 'Set up your professional marketplace profile to start receiving bookings'
            : 'Update your experience details and public worker information'}
        </p>
      </div>

      <ErrorMessage message={serverError} onDismiss={() => setServerError('')} />

      <form onSubmit={handleSubmit} noValidate>
        {/* Bio Textarea */}
        <div style={{ marginBottom: '18px', textAlign: 'left' }}>
          <label
            htmlFor="worker-bio"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '6px',
            }}
          >
            Professional Bio
          </label>
          <textarea
            id="worker-bio"
            name="bio"
            rows="4"
            placeholder="Describe your trade, primary skills, past projects, or cooperative specialization (e.g., residential plumbing, certified electrical wiring)..."
            value={formData.bio}
            onChange={handleChange}
            disabled={isSubmitting}
            maxLength={1000}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: fieldErrors.bio ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
              fontSize: '14px',
              fontFamily: 'inherit',
              color: '#0f172a',
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
            <span>{fieldErrors.bio && <strong style={{ color: '#ef4444' }}>{fieldErrors.bio}</strong>}</span>
            <span>{formData.bio.length} / 1000 characters</span>
          </div>
        </div>

        {/* Experience Years */}
        <Input
          id="worker-experience"
          name="experienceYears"
          type="number"
          label="Years of Work Experience"
          placeholder="e.g. 5"
          min="0"
          max="60"
          value={formData.experienceYears}
          onChange={handleChange}
          error={fieldErrors.experienceYears}
          disabled={isSubmitting}
          helperText="Enter your total years of trade or field experience (0 to 60)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        {/* Profile Photo URL */}
        <Input
          id="worker-photo-url"
          name="profilePhotoUrl"
          type="url"
          label="Profile Photo URL (Optional)"
          placeholder="https://example.com/my-photo.jpg"
          value={formData.profilePhotoUrl}
          onChange={handleChange}
          error={fieldErrors.profilePhotoUrl}
          disabled={isSubmitting}
          helperText="Direct public web link to your profile picture"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          }
        />

        {/* Actions Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
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
          >
            {isCreating ? 'Create Profile' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkerProfileForm;
