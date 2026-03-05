import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export interface ErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
  message?: string;
  compact?: boolean;
}

export function ErrorFallback({ error, onRetry, message, compact = false }: ErrorFallbackProps) {
  const displayMessage = message || error?.message || 'Une erreur est survenue';

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        <AlertOctagon size={16} className="shrink-0" />
        <span className="flex-1 truncate">{displayMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="shrink-0 text-red-600 hover:text-red-800 underline text-xs font-medium"
            aria-label="Réessayer"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-xl bg-red-50 border border-red-200 p-6 flex flex-col items-start gap-3"
    >
      <div className="flex items-center gap-2 text-red-700">
        <AlertOctagon size={20} />
        <h3 className="text-base font-semibold">Erreur</h3>
      </div>
      <p className="text-sm text-red-600">{displayMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Réessayer le chargement"
        >
          <RefreshCw size={14} />
          Réessayer
        </button>
      )}
    </div>
  );
}

export default ErrorFallback;
