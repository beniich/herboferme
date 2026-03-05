'use client';

import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-[var(--bg3)] p-1 rounded-xl border border-[var(--border)]">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'light' 
            ? 'bg-[var(--gold)] text-white shadow-lg' 
            : 'text-[var(--text3)] hover:text-[var(--text2)]'
        }`}
        title="Mode Clair"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'dark' 
            ? 'bg-[var(--gold)] text-white shadow-lg' 
            : 'text-[var(--text3)] hover:text-[var(--text2)]'
        }`}
        title="Mode Sombre"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'system' 
            ? 'bg-[var(--gold)] text-white shadow-lg' 
            : 'text-[var(--text3)] hover:text-[var(--text2)]'
        }`}
        title="Système"
      >
        <Laptop size={16} />
      </button>
    </div>
  );
}
