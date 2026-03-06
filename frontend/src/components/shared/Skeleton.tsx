import React from 'react';

interface SkeletonProps {
  count?: number;
  className?: string;
  type?: 'card' | 'list' | 'text' | 'chart' | 'table';
}

/** Carte KPI en chargement — s'insère dans une grille externe */
export function CardSkeleton({ count = 1, className = '' }: SkeletonProps) {
  if (count === 1) {
    return (
      <div
        className={`h-28 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }
  // Grille autonome quand count > 1
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/** Lignes de tableau en chargement */
export function TableSkeleton({ count = 5, className = '' }: SkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`} aria-busy="true" aria-label="Chargement...">
      {/* En-tête simulé */}
      <div className="h-10 rounded-lg bg-gray-100 animate-pulse" aria-hidden="true" />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-lg bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 animate-pulse"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/** Placeholder texte en ligne */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded bg-gray-200 animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/** Placeholder graphique */
export function ChartSkeleton({ height = 'h-64', className = '' }: { height?: string; className?: string }) {
  return (
    <div className={`${height} rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse ${className}`} aria-hidden="true" />
  );
}

/** Dispatcher component used as default export */
export const Skeleton = ({ type, count = 1, className }: SkeletonProps) => {
  switch (type) {
    case 'card':  return <CardSkeleton count={count} className={className} />;
    case 'list':  return <TableSkeleton count={count} className={className} />;
    case 'table': return <TableSkeleton count={count} className={className} />;
    case 'chart': return <ChartSkeleton className={className} />;
    case 'text':  return <TextSkeleton lines={count} />;
    default:      return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
  }
};

export default Skeleton;
