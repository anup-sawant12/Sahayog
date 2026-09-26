import { Link } from 'react-router-dom';
import ServiceRequestForm from '../../components/matching/ServiceRequestForm';

export const ServiceRequest = () => {
  return (
    <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 24px', textAlign: 'left' }}>
      {/* Breadcrumb / Back Link */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/customer/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Request a Service
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Enter the service required, schedule, and your location. Our rule-based matching engine will find verified workers best suited for your job.
        </p>
      </div>

      {/* Form Container */}
      <ServiceRequestForm />
    </div>
  );
};

export default ServiceRequest;
