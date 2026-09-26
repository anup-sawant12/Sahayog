import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';

export const Register = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the cooperative service marketplace"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
