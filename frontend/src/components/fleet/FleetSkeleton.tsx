import React from 'react';

export const FleetSkeleton = () => (
  <div className="page active" id="page-fleet" style={{ padding: '24px' }}>
    <div className="page-header" style={{ marginBottom: '24px' }}>
      <div>
        <div className="skeleton skeleton-title" style={{ width: '300px', height: '32px', background: 'var(--bg2)', borderRadius: '8px' }} />
        <div className="skeleton skeleton-text" style={{ width: '400px', height: '16px', marginTop: '8px', background: 'var(--bg2)', borderRadius: '4px' }} />
      </div>
    </div>

    {/* Stat Cards Skeleton */}
    <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" style={{ height: '120px', background: 'var(--bg2)', borderRadius: '12px' }} />
      ))}
    </div>

    {/* Table Skeleton */}
    <div className="panel" style={{ background: 'var(--panel)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
      <div className="skeleton skeleton-rows" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-row" style={{ height: '48px', marginBottom: '8px', background: 'var(--bg2)', borderRadius: '8px' }} />
        ))}
      </div>
    </div>
  </div>
);
