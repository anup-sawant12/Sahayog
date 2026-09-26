import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import ServiceRequest from '../pages/customer/ServiceRequest';
import MatchResults from '../pages/customer/MatchResults';
import BookWorker from '../pages/customer/BookWorker';
import MyBookings from '../pages/customer/MyBookings';
import CustomerBookingDetails from '../pages/customer/BookingDetails';
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import JobRequests from '../pages/worker/JobRequests';
import JobRequestDetails from '../pages/worker/JobRequestDetails';
import WorkerProfile from '../pages/worker/WorkerProfile';
import WorkerSkills from '../pages/worker/WorkerSkills';
import WorkerCertifications from '../pages/worker/WorkerCertifications';
import WorkerAvailability from '../pages/worker/WorkerAvailability';
import WorkerServiceAreas from '../pages/worker/WorkerServiceAreas';
import WorkerServices from '../pages/worker/WorkerServices';
import Profile from '../pages/profile/Profile';
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === 'WORKER' ? '/worker/dashboard' : '/customer/dashboard'}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === 'WORKER' ? '/worker/dashboard' : '/customer/dashboard'}
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === 'WORKER' ? '/worker/dashboard' : '/customer/dashboard'}
              replace
            />
          ) : (
            <Register />
          )
        }
      />

      {/* Protected Profile Route (Accessible by any authenticated role) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Protected Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/request-service" element={<ServiceRequest />} />
        <Route path="/customer/matches/:id" element={<MatchResults />} />
        <Route path="/customer/book/:requestId/:workerProfileId/:workerServiceId" element={<BookWorker />} />
        <Route path="/customer/bookings" element={<MyBookings />} />
        <Route path="/customer/bookings/:id" element={<CustomerBookingDetails />} />
      </Route>

      {/* Protected Worker Routes */}
      <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/worker/bookings" element={<JobRequests />} />
        <Route path="/worker/bookings/:id" element={<JobRequestDetails />} />
        <Route path="/worker/profile" element={<WorkerProfile />} />
        <Route path="/worker/skills" element={<WorkerSkills />} />
        <Route path="/worker/certifications" element={<WorkerCertifications />} />
        <Route path="/worker/availability" element={<WorkerAvailability />} />
        <Route path="/worker/service-areas" element={<WorkerServiceAreas />} />
        <Route path="/worker/services" element={<WorkerServices />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
