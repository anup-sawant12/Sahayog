import { useState, useMemo } from 'react';
import ServiceCard from './ServiceCard';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';

export const ServiceList = ({
  services = [],
  isLoading = false,
  error = null,
  onRetry,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter and sort services locally
  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];

    // Filter by search query (name or category)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.category && s.category.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sort: ACTIVE first, then category, then name
    return result.sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;

      const catDiff = (a.category || '').localeCompare(b.category || '');
      if (catDiff !== 0) return catDiff;

      return (a.name || '').localeCompare(b.name || '');
    });
  }, [services, searchQuery, statusFilter]);

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
          Loading your services...
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
        {onRetry && (
          <div style={{ marginTop: '14px' }}>
            <Button variant="outline" size="small" onClick={onRetry}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!services || services.length === 0) {
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
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          No services added yet
        </h3>

        <p style={{ maxWidth: '400px', margin: '0 auto 18px', color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
          Add the services you provide so customers can discover and request them.
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
          Add Service
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '340px' }}>
          <span
            style={{
              position: 'absolute',
              left: '9px',
              top: '9px',
              color: '#94a3b8',
              pointerEvents: 'none',
              display: 'inline-flex',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '32px',
              padding: '0 10px 0 28px',
              fontSize: '12px',
              fontFamily: 'inherit',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#f8fafc',
              color: '#0f172a',
            }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>
            Status:
          </span>
          {[
            { key: 'ALL', label: 'All' },
            { key: 'ACTIVE', label: 'Active' },
            { key: 'INACTIVE', label: 'Inactive' },
          ].map((tab) => {
            const isSelected = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  height: '26px',
                  padding: '0 9px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: `1px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                  background: isSelected ? '#eef2ff' : '#ffffff',
                  color: isSelected ? '#4f46e5' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid or Empty Filter Result */}
      {filteredAndSortedServices.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '28px 16px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 500 }}>
            No services match your filters.
          </p>
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            style={{ height: '28px', fontSize: '12px' }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {filteredAndSortedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceList;
