'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrencyStore, CURRENCIES, Currency } from '@/store/currencyStore';
import { ChevronDown, Check } from 'lucide-react';

export function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Changer la devise"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg3)] border border-[var(--border)] hover:border-[var(--gold)] transition-all text-[var(--text2)] hover:text-[var(--gold)]"
      >
        <span className="text-base leading-none">{currency.flag}</span>
        {!compact && (
          <>
            <span className="text-xs font-bold tracking-wide">{currency.code}</span>
            <span className="text-xs opacity-60">{currency.symbol}</span>
          </>
        )}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-[var(--panel)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 space-y-0.5">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                  c.code === currency.code
                    ? 'bg-[var(--gold)] text-white'
                    : 'hover:bg-[var(--bg3)] text-[var(--text2)]'
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-xs">{c.code}</div>
                  <div className={`text-[10px] ${c.code === currency.code ? 'text-white/70' : 'text-[var(--text3)]'}`}>{c.label}</div>
                </div>
                <span className={`text-xs font-bold ${c.code === currency.code ? 'text-white/80' : 'text-[var(--text3)]'}`}>{c.symbol}</span>
                {c.code === currency.code && <Check size={12} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
