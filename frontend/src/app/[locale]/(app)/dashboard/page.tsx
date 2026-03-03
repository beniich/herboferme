'use client';

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner />
        <p className="text-sm font-mono text-emerald-500 animate-pulse uppercase tracking-widest">Initialisation des donn  es...</p>
      </div>
    </div>
  );

  return (
    <iframe
        src="/agro-dashboard.html"
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            border: 'none',
            zIndex: 9999,
            background: '#0b0f0a',
        }}
        title="AgroMa  tre     Tableau de Bord Agricole"
    />
  );
}
