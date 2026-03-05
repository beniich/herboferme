import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyCode = 'MAD' | 'EUR' | 'USD' | 'GBP' | 'DZD' | 'TND';

export interface Currency {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'MAD', label: 'Dirham Marocain', symbol: 'DH', locale: 'fr-MA', flag: '🇲🇦' },
  { code: 'EUR', label: 'Euro',            symbol: '€',  locale: 'fr-FR', flag: '🇪🇺' },
  { code: 'USD', label: 'Dollar US',       symbol: '$',  locale: 'en-US', flag: '🇺🇸' },
  { code: 'GBP', label: 'Livre Sterling',  symbol: '£',  locale: 'en-GB', flag: '🇬🇧' },
  { code: 'DZD', label: 'Dinar Algérien',  symbol: 'DA', locale: 'fr-DZ', flag: '🇩🇿' },
  { code: 'TND', label: 'Dinar Tunisien',  symbol: 'DT', locale: 'fr-TN', flag: '🇹🇳' },
];

interface CurrencyState {
  currency: Currency;
  setCurrency: (code: CurrencyCode) => void;
  format: (amount: number, compact?: boolean) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: CURRENCIES[0], // MAD default
      setCurrency: (code) => {
        const found = CURRENCIES.find(c => c.code === code);
        if (found) set({ currency: found });
      },
      format: (amount, compact = false) => {
        const { currency } = get();
        try {
          if (compact && Math.abs(amount) >= 1000) {
            const num = new Intl.NumberFormat(currency.locale, {
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(amount);
            return `${num} ${currency.symbol}`;
          }
          return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(amount);
        } catch {
          return `${amount.toLocaleString()} ${currency.symbol}`;
        }
      },
    }),
    {
      name: 'herbute-currency',
      partialize: (s) => ({ currency: s.currency }),
    }
  )
);
