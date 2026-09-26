import { useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

export const Login = () => {
  const location = useLocation();
  const noticeMessage = location.state?.message;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your account"
    >
      {noticeMessage && (
        <div className="info-banner" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{noticeMessage}</span>
        </div>
      )}
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
