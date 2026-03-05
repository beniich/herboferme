import React from 'react';

interface FleetStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'green' | 'orange' | 'red';
  trend?: string;
}

export const FleetStatCard = React.memo(({ label, value, icon, color, trend }: FleetStatCardProps) => {
  const colorMap = {
    green: 'rgba(90, 158, 69, 0.1)',
    orange: 'rgba(200, 146, 26, 0.1)',
    red: 'rgba(192, 57, 43, 0.1)',
  };

  const textColorMap = {
    green: 'var(--green2)',
    orange: 'var(--gold2)',
    red: 'var(--red)',
  };

  return (
    <div
      className="fleet-stat-card"
      style={{
        background: colorMap[color],
        borderLeft: `4px solid ${textColorMap[color]}`,
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
      }}
    >
      <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="stat-label" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value" style={{ color: textColorMap[color], fontSize: '32px', fontWeight: '600' }}>
        {value}
      </div>
      {trend && <div className="stat-trend" style={{ fontSize: '12px', color: 'var(--text3)' }}>{trend}</div>}
    </div>
  );
});
FleetStatCard.displayName = 'FleetStatCard';
