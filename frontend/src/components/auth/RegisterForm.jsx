import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER', // Default 'CUSTOMER' | 'WORKER'
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute password strength metrics
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: '#e2e8f0' };

    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) {
      return { score: 1, label: 'Weak', color: '#ef4444' };
    }
    if (score <= 4) {
      return { score: 2, label: 'Moderate', color: '#f59e0b' };
    }
    return { score: 3, label: 'Strong', color: '#10b981' };
  }, [formData.password]);

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

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Must contain at least one lowercase letter';
    } else if (!/\d/.test(formData.password)) {
      errors.password = 'Must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      errors.password = 'Must contain at least one special character';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (res && res.success) {
        setSuccessMessage('Registration successful! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Account created successfully! Please sign in.' },
            replace: true,
          });
        }, 1200);
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const apiMessage =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'An account with this email or phone already exists'
          : null) ||
        'Registration failed. Please verify your details.';

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
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      <ErrorMessage message={serverError} onDismiss={() => setServerError('')} />

      {successMessage && (
        <div className="success-banner" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Account Type Segmented Control */}
      <div className="role-selector-group">
        <label className="role-selector-label">I want to register as</label>
        <div className="role-selector-tabs" role="radiogroup" aria-label="Account Type">
          <button
            type="button"
            role="radio"
            aria-checked={formData.role === 'CUSTOMER'}
            className={`role-tab ${formData.role === 'CUSTOMER' ? 'active' : ''}`}
            onClick={() => handleRoleChange('CUSTOMER')}
            disabled={isSubmitting}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div>
              <div className="role-title">Customer</div>
              <div className="role-desc">Hire skilled help</div>
            </div>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={formData.role === 'WORKER'}
            className={`role-tab ${formData.role === 'WORKER' ? 'active' : ''}`}
            onClick={() => handleRoleChange('WORKER')}
            disabled={isSubmitting}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <div>
              <div className="role-title">Worker</div>
              <div className="role-desc">Offer skilled services</div>
            </div>
          </button>
        </div>
      </div>

      <Input
        id="register-name"
        name="name"
        type="text"
        label="Full Name"
        placeholder="e.g. Ramesh Patil"
        autoComplete="name"
        value={formData.name}
        onChange={handleChange}
        error={fieldErrors.name}
        required
        disabled={isSubmitting}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        }
      />

      <Input
        id="register-email"
        name="email"
        type="email"
        label="Email Address"
        placeholder="name@example.com"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        error={fieldErrors.email}
        required
        disabled={isSubmitting}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        }
      />

      <Input
        id="register-phone"
        name="phone"
        type="tel"
        label="Phone Number"
        placeholder="10-digit mobile number"
        autoComplete="tel"
        value={formData.phone}
        onChange={handleChange}
        error={fieldErrors.phone}
        required
        disabled={isSubmitting}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        }
      />

      <div>
        <Input
          id="register-password"
          name="password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password}
          required
          disabled={isSubmitting}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
        />

        {/* Subtle Password Strength Indicator */}
        {formData.password && (
          <div className="pwd-strength-container" aria-live="polite">
            <div className="pwd-strength-bars">
              <div className={`pwd-bar ${passwordStrength.score >= 1 ? 'filled' : ''}`} style={{ backgroundColor: passwordStrength.score >= 1 ? passwordStrength.color : '#e2e8f0' }}></div>
              <div className={`pwd-bar ${passwordStrength.score >= 2 ? 'filled' : ''}`} style={{ backgroundColor: passwordStrength.score >= 2 ? passwordStrength.color : '#e2e8f0' }}></div>
              <div className={`pwd-bar ${passwordStrength.score >= 3 ? 'filled' : ''}`} style={{ backgroundColor: passwordStrength.score >= 3 ? passwordStrength.color : '#e2e8f0' }}></div>
            </div>
            <div className="pwd-strength-label" style={{ color: passwordStrength.color }}>
              Strength: {passwordStrength.label}
            </div>
          </div>
        )}
      </div>

      <div className="auth-submit-row">
        <Button
          type="submit"
          variant="primary"
          size="medium"
          fullWidth
          isLoading={isSubmitting}
        >
          Create Account
        </Button>
      </div>

      <div className="auth-footer-text">
        Already have an account?{' '}
        <Link to="/login" className="auth-action-link">
          Sign in
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
