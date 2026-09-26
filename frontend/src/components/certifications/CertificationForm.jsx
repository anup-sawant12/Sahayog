import { useState } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const isValidUrl = (urlStr) => {
  if (!urlStr || !urlStr.trim()) return true;
  try {
    const url = new URL(urlStr.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const formatDateForInput = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export const CertificationForm = ({
  initialData = null,
  isEditMode = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    issuingOrganization: initialData?.issuingOrganization || '',
    certificateNumber: initialData?.certificateNumber || '',
    issueDate: formatDateForInput(initialData?.issueDate),
    expiryDate: formatDateForInput(initialData?.expiryDate),
    documentUrl: initialData?.documentUrl || '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Certification name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Certification name must be at least 2 characters';
    }

    if (!formData.issuingOrganization.trim()) {
      newErrors.issuingOrganization = 'Issuing organization is required';
    } else if (formData.issuingOrganization.trim().length < 2) {
      newErrors.issuingOrganization = 'Issuing organization must be at least 2 characters';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    } else if (formData.issueDate > todayStr) {
      newErrors.issueDate = 'Issue date cannot be in the future';
    }

    if (formData.expiryDate) {
      if (formData.issueDate && formData.expiryDate < formData.issueDate) {
        newErrors.expiryDate = 'Expiry date cannot be before issue date';
      }
    }

    if (formData.documentUrl && formData.documentUrl.trim()) {
      if (!isValidUrl(formData.documentUrl)) {
        newErrors.documentUrl = 'Please enter a valid URL (starting with http:// or https://)';
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
      name: formData.name.trim(),
      issuingOrganization: formData.issuingOrganization.trim(),
      certificateNumber: formData.certificateNumber.trim() || null,
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate || null,
      documentUrl: formData.documentUrl.trim() || null,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors?.[0]?.message) ||
        'Failed to save certification. Please review your details and try again.';
      setServerError(msg);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '42px',
    padding: '0 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? '#ef4444' : '#cbd5e1'}`,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#0f172a',
    transition: 'border-color 0.15s ease',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '6px',
    textAlign: 'left',
  };

  const errorTextStyle = {
    fontSize: '12px',
    color: '#dc2626',
    marginTop: '4px',
    textAlign: 'left',
    display: 'block',
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorMessage message={serverError} onDismiss={() => setServerError('')} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Certification Name */}
        <div>
          <label htmlFor="cert-name" style={labelStyle}>
            Certification Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="cert-name"
            type="text"
            name="name"
            placeholder="e.g. Certified Master Electrician, OSHA 30"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            style={inputStyle(Boolean(errors.name))}
          />
          {errors.name && <span style={errorTextStyle}>{errors.name}</span>}
        </div>

        {/* Issuing Organization */}
        <div>
          <label htmlFor="cert-org" style={labelStyle}>
            Issuing Organization <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="cert-org"
            type="text"
            name="issuingOrganization"
            placeholder="e.g. National Electrical Contractors Association, OSHA"
            value={formData.issuingOrganization}
            onChange={handleChange}
            disabled={isSubmitting}
            style={inputStyle(Boolean(errors.issuingOrganization))}
          />
          {errors.issuingOrganization && <span style={errorTextStyle}>{errors.issuingOrganization}</span>}
        </div>

        {/* Certificate Number */}
        <div>
          <label htmlFor="cert-num" style={labelStyle}>
            Certificate Number <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
          </label>
          <input
            id="cert-num"
            type="text"
            name="certificateNumber"
            placeholder="e.g. ELEC-2024-9842"
            value={formData.certificateNumber}
            onChange={handleChange}
            disabled={isSubmitting}
            style={inputStyle(Boolean(errors.certificateNumber))}
          />
          {errors.certificateNumber && <span style={errorTextStyle}>{errors.certificateNumber}</span>}
        </div>

        {/* Issue Date & Expiry Date Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div>
            <label htmlFor="cert-issue-date" style={labelStyle}>
              Issue Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="cert-issue-date"
              type="date"
              name="issueDate"
              max={todayStr}
              value={formData.issueDate}
              onChange={handleChange}
              disabled={isSubmitting}
              style={inputStyle(Boolean(errors.issueDate))}
            />
            {errors.issueDate && <span style={errorTextStyle}>{errors.issueDate}</span>}
          </div>

          <div>
            <label htmlFor="cert-expiry-date" style={labelStyle}>
              Expiry Date <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              id="cert-expiry-date"
              type="date"
              name="expiryDate"
              min={formData.issueDate || undefined}
              value={formData.expiryDate}
              onChange={handleChange}
              disabled={isSubmitting}
              style={inputStyle(Boolean(errors.expiryDate))}
            />
            {errors.expiryDate && <span style={errorTextStyle}>{errors.expiryDate}</span>}
          </div>
        </div>

        {/* Certificate Document URL */}
        <div>
          <label htmlFor="cert-doc-url" style={labelStyle}>
            Certificate Document URL <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
          </label>
          <input
            id="cert-doc-url"
            type="url"
            name="documentUrl"
            placeholder="https://example.com/certificates/my-cert.pdf"
            value={formData.documentUrl}
            onChange={handleChange}
            disabled={isSubmitting}
            style={inputStyle(Boolean(errors.documentUrl))}
          />
          {errors.documentUrl && <span style={errorTextStyle}>{errors.documentUrl}</span>}
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block', textAlign: 'left' }}>
            Link to your scanned certificate or verification registry.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '28px',
          paddingTop: '18px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
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
          style={{ background: '#0d9488' }}
        >
          {isEditMode ? 'Save Changes' : 'Add Certification'}
        </Button>
      </div>
    </form>
  );
};

export default CertificationForm;
