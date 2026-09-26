import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific error on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
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

    setIsSubmitting(true);

    try {
      const res = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (res && res.success) {
        const userRole = res.data?.user?.role;
        if (userRole === 'WORKER') {
          navigate('/worker/dashboard', { replace: true });
        } else {
          navigate('/customer/dashboard', { replace: true });
        }
      }
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        (err.response?.status === 401 ? 'Invalid email or password' : null) ||
        (err.response?.status === 403 ? 'Your account is suspended or inactive' : null) ||
        'Unable to sign in. Please verify your connection and try again.';
      setServerError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      <ErrorMessage message={serverError} onDismiss={() => setServerError('')} />

      <Input
        id="login-email"
        name="email"
        type="email"
        label="Email address"
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
        id="login-password"
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
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

      <div className="auth-options-row">
        <label className="checkbox-container">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <span className="checkbox-label">Remember me</span>
        </label>

        <a
          href="#forgot-password"
          className="auth-inline-link"
          onClick={(e) => {
            e.preventDefault();
            alert('Password reset instructions will be sent to your registered email.');
          }}
        >
          Forgot password?
        </a>
      </div>

      <div className="auth-submit-row">
        <Button
          type="submit"
          variant="primary"
          size="medium"
          fullWidth
          isLoading={isSubmitting}
        >
          Sign In
        </Button>
      </div>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <div className="auth-footer-text">
        Don’t have an account?{' '}
        <Link to="/register" className="auth-action-link">
          Create account
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
