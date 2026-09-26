import ServiceAreaCard from './ServiceAreaCard';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';

/**
 * ServiceAreaList component
 * Renders the collection of worker service areas with loading, empty, and error states.
 * Uses standard CSS styles (no Tailwind dependency).
 */
export default function ServiceAreaList({
  serviceAreas = [],
  isLoading = false,
  error = null,
  onAdd,
  onEdit,
  onDelete
}) {
  if (isLoading) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '48px 20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Loader size="medium" color="#4f46e5" />
        <p style={{ marginTop: '12px', color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
          Loading service areas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '32px 20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <ErrorMessage message={error} />
        {onAdd && (
          <div style={{ marginTop: '14px' }}>
            <Button variant="outline" size="small" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!serviceAreas || serviceAreas.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1.5px dashed #cbd5e1',
          padding: '36px 20px',
          textAlign: 'center',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#eef2ff',
            border: '1px solid #e0e7ff',
            color: '#4f46e5',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          No service areas yet
        </h3>

        <p style={{ maxWidth: '400px', margin: '0 auto 18px', color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
          Add the areas where you're willing to accept work.
        </p>

        <Button
          type="button"
          variant="primary"
          size="small"
          onClick={onAdd}
          style={{ background: '#4f46e5' }}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Service Area
        </Button>
      </div>
    );
  }

  // Sort areas so that isPrimary === true is first
  const sortedAreas = [...serviceAreas].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.city || '').localeCompare(b.city || '');
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
      }}
    >
      {sortedAreas.map((area) => (
        <ServiceAreaCard
          key={area.id}
          serviceArea={area}
          area={area}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
