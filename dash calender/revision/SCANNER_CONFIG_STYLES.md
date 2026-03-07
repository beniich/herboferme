# 🎨 FootballHub+ Scanner - Configuration & Styles Complets

## 📁 Structure des Fichiers

```
src/
├── pages/
│   └── Scanner.tsx                    ✅ Component principal
├── utils/
│   ├── qrScanner.ts                  ✅ Logique scanner
│   ├── haptics.ts                    ✅ Vibrations
│   ├── platform.ts                   ✅ Détection plateforme
│   └── api.ts                        ✅ Configuration API
├── config/
│   └── api.ts                        ✅ Config API
├── styles/
│   └── scanner.css                   ✅ Styles scanner
└── types/
    └── scanner.ts                    ✅ TypeScript types
```

---

## 🔧 Configuration API

```typescript
// src/config/api.ts
import { Capacitor } from '@capacitor/core';

export const getApiUrl = (): string => {
  const platform = Capacitor.getPlatform();
  
  if (platform === 'web') {
    // Development
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  
  // Production (Mobile)
  return import.meta.env.VITE_API_URL || 'https://api.footballhub.ma';
};

export const API_CONFIG = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

---

## 🎨 Styles CSS Complets

```css
/* src/styles/scanner.css */

/* Camera Overlay */
.camera-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  -webkit-mask: radial-gradient(circle 160px at center, transparent 100%, black 100%);
  mask: radial-gradient(circle 160px at center, transparent 100%, black 100%);
}

/* Scan Frame */
.scan-frame {
  border: 2px solid rgba(242, 185, 13, 0.3);
  position: relative;
  animation: pulse-frame 2s ease-in-out infinite;
}

@keyframes pulse-frame {
  0%, 100% {
    border-color: rgba(242, 185, 13, 0.3);
  }
  50% {
    border-color: rgba(242, 185, 13, 0.6);
  }
}

/* Scan Line Animation */
@keyframes scan-line {
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

.scan-line-animated {
  animation: scan-line 2s ease-in-out infinite;
}

/* Bottom Sheet Animations */
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.bottom-sheet {
  animation: slide-up 0.3s ease-out;
}

/* Success Pulse */
@keyframes success-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.success-animation {
  animation: success-pulse 0.5s ease-in-out;
}

/* Error Shake */
@keyframes error-shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.error-animation {
  animation: error-shake 0.5s ease-in-out;
}

/* Fade In */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fade-in 0.3s ease-in;
}

/* Slide In From Top */
@keyframes slide-in-top {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-in {
  animation: slide-in-top 0.3s ease-out;
}

/* Safe Area (iOS) */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right);
}

/* Scrollbar Styling */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(242, 185, 13, 0.3);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(242, 185, 13, 0.5);
}

/* Blur Backdrop */
.backdrop-blur-strong {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.backdrop-blur-medium {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Glass Effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glow Effect */
.glow-primary {
  box-shadow: 0 0 20px rgba(242, 185, 13, 0.3);
}

.glow-green {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.glow-red {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

/* Loading Spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Bounce */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}
```

---

## 📦 TypeScript Types

```typescript
// src/types/scanner.ts

export interface ScanResult {
  id: string;
  status: 'success' | 'error' | 'duplicate' | 'expired';
  name: string;
  membershipNumber?: string;
  gate: string;
  ticketId: string;
  ticketType: 'VIP' | 'Standard' | 'EarlyBird';
  section?: string;
  row?: string;
  seat?: string;
  timestamp: Date;
  message: string;
  eventName?: string;
  photo?: string;
}

export interface ScanStats {
  total: number;
  success: number;
  errors: number;
  successRate: number;
}

export interface TicketValidationResponse {
  success: boolean;
  message?: string;
  ticket?: {
    ticketNumber: string;
    ticketType: 'VIP' | 'Standard' | 'EarlyBird';
    status: string;
    isValidated: boolean;
    validatedAt?: Date;
    member: {
      firstName: string;
      lastName: string;
      membershipNumber: string;
      email: string;
      photo?: string;
    };
    event?: {
      title: string;
      startDate: Date;
      venue: {
        name: string;
        city: string;
      };
    };
    seating?: {
      section: string;
      row: string;
      seat: string;
    };
  };
}

export interface ScannerSettings {
  autoScan: boolean;
  flashEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  cameraFacing: 'front' | 'back';
}
```

---

## ⚙️ Utilitaire API

```typescript
// src/utils/api.ts
import { getApiUrl, API_CONFIG } from '@/config/api';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl();
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      ...API_CONFIG.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
```

---

## 🎯 Hook React Personnalisé

```typescript
// src/hooks/useScanner.ts
import { useState, useEffect, useCallback } from 'react';
import { qrScanner } from '@/utils/qrScanner';
import { hapticFeedback } from '@/utils/haptics';
import { apiClient } from '@/utils/api';
import type { ScanResult, ScanStats, TicketValidationResponse } from '@/types/scanner';

export const useScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [stats, setStats] = useState<ScanStats>({
    total: 0,
    success: 0,
    errors: 0,
    successRate: 0,
  });

  const validateTicket = useCallback(async (qrData: string): Promise<ScanResult> => {
    try {
      const userId = localStorage.getItem('userId');
      
      const response = await apiClient.post<TicketValidationResponse>(
        '/api/tickets/validate-qr',
        {
          qrCode: qrData,
          validatorId: userId,
        }
      );

      if (response.success && response.ticket) {
        await hapticFeedback.notification('success');

        const member = response.ticket.member;
        const ticket = response.ticket;

        const scanResult: ScanResult = {
          id: Date.now().toString(),
          status: 'success',
          name: `${member.firstName} ${member.lastName}`,
          membershipNumber: member.membershipNumber,
          gate: 'Gate 4',
          ticketId: ticket.ticketNumber,
          ticketType: ticket.ticketType,
          section: ticket.seating?.section,
          row: ticket.seating?.row,
          seat: ticket.seating?.seat,
          timestamp: new Date(),
          message: 'Access Granted',
          eventName: ticket.event?.title,
          photo: member.photo,
        };

        setStats(prev => ({
          total: prev.total + 1,
          success: prev.success + 1,
          errors: prev.errors,
          successRate: ((prev.success + 1) / (prev.total + 1)) * 100,
        }));

        return scanResult;
      } else {
        await hapticFeedback.notification('error');

        let errorStatus: 'error' | 'duplicate' | 'expired' = 'error';
        if (response.message?.includes('already') || response.message?.includes('used')) {
          errorStatus = 'duplicate';
        } else if (response.message?.includes('expired')) {
          errorStatus = 'expired';
        }

        const scanResult: ScanResult = {
          id: Date.now().toString(),
          status: errorStatus,
          name: 'Invalid Ticket',
          gate: '-',
          ticketId: '-',
          ticketType: 'Standard',
          timestamp: new Date(),
          message: response.message || 'Ticket Invalid',
        };

        setStats(prev => ({
          total: prev.total + 1,
          success: prev.success,
          errors: prev.errors + 1,
          successRate: (prev.success / (prev.total + 1)) * 100,
        }));

        return scanResult;
      }
    } catch (error: any) {
      await hapticFeedback.notification('error');

      const errorScan: ScanResult = {
        id: Date.now().toString(),
        status: 'error',
        name: 'Error',
        gate: '-',
        ticketId: '-',
        ticketType: 'Standard',
        timestamp: new Date(),
        message: error.message || 'Network Error',
      };

      return errorScan;
    }
  }, []);

  const startScan = useCallback(async () => {
    try {
      setScanning(true);
      await hapticFeedback.medium();

      const qrData = await qrScanner.startScan();

      if (qrData) {
        const result = await validateTicket(qrData);
        setCurrentScan(result);
        setRecentScans(prev => [result, ...prev.slice(0, 49)]);

        setTimeout(() => setCurrentScan(null), 5000);
      }
    } catch (error: any) {
      console.error('Scan error:', error);
    } finally {
      setScanning(false);
    }
  }, [validateTicket]);

  return {
    scanning,
    recentScans,
    currentScan,
    stats,
    startScan,
  };
};
```

---

## ✅ Checklist d'Intégration

### Fichiers à Créer
- [ ] `src/pages/Scanner.tsx` - Component principal
- [ ] `src/styles/scanner.css` - Styles
- [ ] `src/types/scanner.ts` - Types TypeScript
- [ ] `src/config/api.ts` - Config API
- [ ] `src/utils/api.ts` - Client API
- [ ] `src/hooks/useScanner.ts` - Hook personnalisé

### Import des Styles
```tsx
// src/main.tsx ou App.tsx
import './styles/scanner.css';
```

### Configuration Tailwind
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#f2b90d',
        'background-dark': '#181611',
        'background-light': '#f8f8f5',
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
      },
    },
  },
};
```

### Variables d'Environnement
```bash
# .env
VITE_API_URL=http://localhost:5000
```

---

## 🎉 SCANNER COMPLÈTEMENT HARMONISÉ !

**Améliorations apportées :**
- ✅ Code React/TypeScript propre et structuré
- ✅ Gestion d'état optimisée
- ✅ Types TypeScript complets
- ✅ Hook personnalisé réutilisable
- ✅ Client API avec gestion d'erreurs
- ✅ Animations CSS fluides
- ✅ Safe area iOS support
- ✅ Stats en temps réel
- ✅ Multi-status (success, error, duplicate, expired)
- ✅ Haptic feedback intégré
- ✅ Responsive & Mobile-first
- ✅ Navigation intégrée

**Prêt à l'utiliser ! 🚀**
