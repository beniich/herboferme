import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode | LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'teal';
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
  className?: string;
}

const colorMap = {
  blue:   { bg: 'bg-blue-50/80',   border: 'border-l-blue-500',   text: 'text-blue-600',   icon: 'text-blue-400' },
  green:  { bg: 'bg-green-50/80',  border: 'border-l-green-500',  text: 'text-green-600',  icon: 'text-green-400' },
  orange: { bg: 'bg-orange-50/80', border: 'border-l-orange-500', text: 'text-orange-600', icon: 'text-orange-400' },
  red:    { bg: 'bg-red-50/80',   border: 'border-l-red-500',    text: 'text-red-600',    icon: 'text-red-400' },
  purple: { bg: 'bg-purple-50/80', border: 'border-l-purple-500', text: 'text-purple-600', icon: 'text-purple-400' },
  teal:   { bg: 'bg-teal-50/80',  border: 'border-l-teal-500',   text: 'text-teal-600',   icon: 'text-teal-400' },
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
}: StatCardProps) {
  const styles = colorMap[color];

  return (
    <div
      className={`
        p-5 rounded-xl border-l-4 ${styles.bg} ${styles.border}
        shadow-sm hover:shadow-md transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      aria-label={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className={`text-2xl font-bold ${styles.text}`}>
              {value}
            </span>
            {unit && (
              <span className="text-sm text-gray-400 font-medium">{unit}</span>
            )}
          </div>
          {trend && (
            <p className={`mt-1.5 text-xs font-medium ${
              trendUp === true ? 'text-green-600' : trendUp === false ? 'text-red-500' : 'text-gray-400'
            }`}>
              {trendUp === true && '↑ '}
              {trendUp === false && '↓ '}
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`text-2xl flex-shrink-0 ${styles.icon}`}>
            {typeof Icon === 'function' ? <Icon size={24} /> : Icon}
          </div>
        )}
      </div>
    </div>
  );
});

export default StatCard;
