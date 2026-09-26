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
import CustomerNotifications from '../pages/customer/Notifications';
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import JobRequests from '../pages/worker/JobRequests';
import JobRequestDetails from '../pages/worker/JobRequestDetails';
import WorkerProfile from '../pages/worker/WorkerProfile';
import WorkerSkills from '../pages/worker/WorkerSkills';
import WorkerCertifications from '../pages/worker/WorkerCertifications';
import WorkerAvailability from '../pages/worker/WorkerAvailability';
import WorkerServiceAreas from '../pages/worker/WorkerServiceAreas';
import WorkerServices from '../pages/worker/WorkerServices';
import WorkerDocuments from '../pages/worker/WorkerDocuments';
import WorkerNotifications from '../pages/worker/Notifications';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDocuments from '../pages/admin/AdminDocuments';
import AdminWorkers from '../pages/admin/AdminWorkers';
import AdminWorkerDetails from '../pages/admin/AdminWorkerDetails';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminServiceRequests from '../pages/admin/AdminServiceRequests';
import AdminServices from '../pages/admin/AdminServices';
import AdminNotifications from '../pages/admin/AdminNotifications';
import Profile from '../pages/profile/Profile';
import ProtectedRoute from './ProtectedRoute';

const getDashboardRedirect = (role) => {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'WORKER') return '/worker/dashboard';
  return '/customer/dashboard';
};

export const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardRedirect(user?.role)} replace />
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
            <Navigate to={getDashboardRedirect(user?.role)} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardRedirect(user?.role)} replace />
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
        <Route path="/customer/notifications" element={<CustomerNotifications />} />
      </Route>

      {/* Protected Worker Routes */}
      <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/worker/bookings" element={<JobRequests />} />
        <Route path="/worker/bookings/:id" element={<JobRequestDetails />} />
        <Route path="/worker/notifications" element={<WorkerNotifications />} />
        <Route path="/worker/profile" element={<WorkerProfile />} />
        <Route path="/worker/skills" element={<WorkerSkills />} />
        <Route path="/worker/certifications" element={<WorkerCertifications />} />
        <Route path="/worker/availability" element={<WorkerAvailability />} />
        <Route path="/worker/service-areas" element={<WorkerServiceAreas />} />
        <Route path="/worker/services" element={<WorkerServices />} />
        <Route path="/worker/documents" element={<WorkerDocuments />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/documents" element={<AdminDocuments />} />
        <Route path="/admin/workers" element={<AdminWorkers />} />
        <Route path="/admin/workers/:id" element={<AdminWorkerDetails />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/service-requests" element={<AdminServiceRequests />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
