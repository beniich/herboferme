// ... (rest of the file remains the same until colorVarMap but I'll provide the whole file replacement)
import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode | LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'teal' | 'amber' | 'indigo' | 'rose' | 'zinc' | 'emerald';
  trend?: string | number;
  trendUp?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

const colorVarMap: Record<string, { accent: string; shadow: string }> = {
  blue:    { accent: '#2563eb', shadow: 'rgba(37,99,235,0.25)' },
  green:   { accent: '#215E61', shadow: 'rgba(33,94,97,0.25)' },
  orange:  { accent: '#f97316', shadow: 'rgba(249,115,22,0.25)' },
  red:     { accent: '#e11d48', shadow: 'rgba(225,29,72,0.25)' },
  purple:  { accent: '#7c3aed', shadow: 'rgba(124,58,237,0.25)' },
  teal:    { accent: '#0d9488', shadow: 'rgba(13,148,136,0.25)' },
  amber:   { accent: '#f97316', shadow: 'rgba(249,115,22,0.25)' },
  indigo:  { accent: '#6366f1', shadow: 'rgba(99,102,241,0.25)' },
  rose:    { accent: '#f43f5e', shadow: 'rgba(244,63,94,0.25)' },
  zinc:    { accent: '#71717a', shadow: 'rgba(113,113,122,0.25)' },
  emerald: { accent: '#10b981', shadow: 'rgba(16,185,129,0.25)' },
};

export const StatCard = memo(function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  color = 'blue',
  trend,
  trendUp,
  onClick,
  className = '',
  variant = 'default',
}: StatCardProps) {
  const colors = colorVarMap[color as keyof typeof colorVarMap] || colorVarMap.blue;

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        style={{
          padding: '16px',
          borderRadius: '14px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'rgba(255,255,255,0.06)',
          background: 'var(--panel)',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        }}
        className={`hover:opacity-90 ${className}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: `${colors.shadow}`,
            color: colors.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            {typeof Icon === 'function' ? <Icon size={18} /> : Icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</span>
              {unit && <span style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 500 }}>{unit}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        padding: '20px',
        borderRadius: '18px',
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
        borderLeftColor: colors.accent,
        background: 'var(--panel)',
        boxShadow: `var(--shadow-card), 0 0 0 0 transparent`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      className={className}
      role={onClick ? 'button' : 'article'}
      aria-label={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
            {label}
          </p>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: colors.accent, lineHeight: 1 }}>
              {value}
            </span>
            {unit && (
              <span style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 500 }}>{unit}</span>
            )}
          </div>
          {trend && (
            <p style={{
              marginTop: '6px', fontSize: '11px', fontWeight: 500,
              color: (trendUp ?? (typeof trend === 'number' ? trend >= 0 : undefined)) === true 
                ? '#10b981' 
                : (trendUp ?? (typeof trend === 'number' ? trend < 0 : undefined)) === true 
                  ? '#e11d48' 
                  : 'var(--text3)'
            }}>
              {(trendUp ?? (typeof trend === 'number' ? trend >= 0 : undefined)) === true && '↑ '}
              {(trendUp ?? (typeof trend === 'number' ? trend < 0 : undefined)) === true && '↓ '}
              {typeof trend === 'number' ? (trend > 0 ? `+${trend}` : trend) : trend}
              {typeof trend === 'number' && '%'}
            </p>
          )}
        </div>
        {Icon && (
          <div style={{ fontSize: '24px', color: colors.accent, flexShrink: 0, opacity: 0.85 }}>
            {typeof Icon === 'function' ? <Icon size={24} /> : Icon}
          </div>
        )}
      </div>
    </div>
  );
});

export default StatCard;
