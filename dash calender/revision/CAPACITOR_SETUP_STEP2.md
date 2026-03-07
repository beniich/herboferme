# 📱 Capacitor Setup - Étape 2 : Scanner QR Mobile & Composants

## 📸 Scanner QR Natif

### Installation du Plugin Barcode Scanner

```bash
npm install @capacitor-community/barcode-scanner
npx cap sync
```

### Scanner QR Mobile Component

Créez `src/components/mobile/MobileQRScanner.tsx` :

```typescript
// src/components/mobile/MobileQRScanner.tsx

import React, { useState, useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Camera, X, Flashlight, FlashlightOff } from 'lucide-react';
import { hapticFeedback } from '@/utils/haptics';
import { isNative } from '@/utils/platform';

interface ScanResult {
  success: boolean;
  data?: any;
  message?: string;
}

interface MobileQRScannerProps {
  onScanComplete: (result: ScanResult) => void;
  onClose?: () => void;
}

export const MobileQRScanner: React.FC<MobileQRScannerProps> = ({
  onScanComplete,
  onClose,
}) => {
  const [scanning, setScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    checkPermission();
    
    return () => {
      if (scanning) {
        stopScan();
      }
    };
  }, []);

  const checkPermission = async () => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: false });
      setHasPermission(status.granted);
      
      if (status.denied) {
        // Permission refusée définitivement
        alert('Accès caméra refusé. Veuillez activer dans les paramètres.');
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      setHasPermission(status.granted);
      
      if (status.granted) {
        await startScan();
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  const startScan = async () => {
    if (!isNative()) {
      alert('Scanner QR disponible uniquement sur mobile');
      return;
    }

    try {
      await hapticFeedback.medium();

      // Préparer le scanner
      await BarcodeScanner.hideBackground();
      document.body.classList.add('scanner-active');
      
      setScanning(true);

      // Démarrer le scan
      const result = await BarcodeScanner.startScan();

      // Scan terminé
      if (result.hasContent) {
        await hapticFeedback.success();
        
        // Valider le ticket
        await validateTicket(result.content);
      }
    } catch (error) {
      console.error('Scan error:', error);
      await hapticFeedback.error();
      alert('Erreur lors du scan');
    } finally {
      await stopScan();
    }
  };

  const stopScan = async () => {
    try {
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
      document.body.classList.remove('scanner-active');
      setScanning(false);
      setTorchOn(false);
    } catch (error) {
      console.error('Stop scan error:', error);
    }
  };

  const toggleTorch = async () => {
    try {
      await BarcodeScanner.toggleTorch();
      setTorchOn(!torchOn);
      await hapticFeedback.light();
    } catch (error) {
      console.error('Torch error:', error);
    }
  };

  const validateTicket = async (qrCode: string) => {
    try {
      // Appeler l'API de validation
      const response = await fetch('http://localhost:5000/api/tickets/validate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCode,
          validatorId: 'CURRENT_USER_ID', // TODO: Récupérer l'ID du user connecté
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await hapticFeedback.success();
        onScanComplete({
          success: true,
          data: data.ticket,
          message: data.message,
        });
      } else {
        await hapticFeedback.error();
        onScanComplete({
          success: false,
          message: data.message || 'Ticket invalide',
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      await hapticFeedback.error();
      onScanComplete({
        success: false,
        message: 'Erreur de connexion',
      });
    }
  };

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark p-6">
        <Camera size={64} className="text-primary mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          Accès Caméra Requis
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Pour scanner les tickets QR, nous avons besoin d'accéder à votre caméra.
        </p>
        <button
          onClick={requestPermission}
          className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95"
        >
          Autoriser l'Accès
        </button>
      </div>
    );
  }

  if (!scanning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark p-6">
        <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center mb-6">
          <Camera size={64} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Scanner QR
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Positionnez le code QR dans le cadre pour le scanner
        </p>
        <button
          onClick={startScan}
          className="px-8 py-4 bg-primary text-black rounded-xl font-bold text-lg hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          Démarrer le Scanner
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
        )}
      </div>
    );
  }

  // UI pendant le scan (overlay transparent)
  return (
    <div className="scanner-overlay">
      <style>{`
        .scanner-active {
          background: transparent !important;
        }
        .scanner-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
        }
        .scanner-controls {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 2rem 1.5rem;
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
          z-index: 10000;
        }
        .scanner-frame {
          flex: 1;
          display: flex;
          align-items: center;
          justify-center;
          padding: 2rem;
        }
        .scanner-box {
          width: 280px;
          height: 280px;
          position: relative;
        }
        .scanner-corner {
          position: absolute;
          width: 40px;
          height: 40px;
          border-color: #F9D406;
          border-style: solid;
        }
        .corner-tl { 
          top: 0; left: 0; 
          border-width: 4px 0 0 4px; 
          border-top-left-radius: 12px; 
        }
        .corner-tr { 
          top: 0; right: 0; 
          border-width: 4px 4px 0 0; 
          border-top-right-radius: 12px; 
        }
        .corner-bl { 
          bottom: 0; left: 0; 
          border-width: 0 0 4px 4px; 
          border-bottom-left-radius: 12px; 
        }
        .corner-br { 
          bottom: 0; right: 0; 
          border-width: 0 4px 4px 0; 
          border-bottom-right-radius: 12px; 
        }
        .scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: #F9D406;
          box-shadow: 0 0 10px #F9D406;
          animation: scan 2s ease-in-out infinite;
        }
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          50% { top: 90%; opacity: 1; }
        }
      `}</style>

      {/* Controls */}
      <div className="scanner-controls">
        <div className="flex items-center justify-between">
          <button
            onClick={stopScan}
            className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-colors"
          >
            <X size={24} />
          </button>
          
          <h1 className="text-white font-bold text-lg">Scanner QR</h1>
          
          <button
            onClick={toggleTorch}
            className={`p-3 rounded-full backdrop-blur-md border transition-colors ${
              torchOn
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
            }`}
          >
            {torchOn ? <Flashlight size={24} /> : <FlashlightOff size={24} />}
          </button>
        </div>
      </div>

      {/* Scanner Frame */}
      <div className="scanner-frame">
        <div className="scanner-box">
          <div className="scanner-corner corner-tl" />
          <div className="scanner-corner corner-tr" />
          <div className="scanner-corner corner-bl" />
          <div className="scanner-corner corner-br" />
          <div className="scanner-line" />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-0 right-0 text-center">
        <p className="text-white text-sm font-medium px-6">
          Positionnez le code QR dans le cadre
        </p>
      </div>
    </div>
  );
};
```

---

## 🎨 Mise à Jour du Main Entry Point

### src/main.tsx

```typescript
// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Capacitor imports
import { initializeCapacitor } from './utils/capacitor-init';
import { initPushNotifications } from './utils/push-notifications';

// Initialiser Capacitor
async function initApp() {
  try {
    // Initialiser les plugins Capacitor
    await initializeCapacitor();
    
    // Initialiser les push notifications
    await initPushNotifications();
    
    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('❌ App initialization error:', error);
  }
}

// Démarrer l'initialisation
initApp();

// Render React App
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 🎨 Mise à Jour des Styles Globaux

### src/index.css

Ajoutez ces styles pour le support mobile :

```css
/* src/index.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Variables */
:root {
  --primary: #F9D406;
  --background-dark: #1A1915;
  --surface-dark: #24221A;
  --card-dark: #2F2C1B;
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  background-color: var(--background-dark);
  color: white;
  overflow-x: hidden;
}

/* Safe Area pour iOS */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.pl-safe {
  padding-left: env(safe-area-inset-left);
}

.pr-safe {
  padding-right: env(safe-area-inset-right);
}

/* Safe area avec padding minimum */
.pt-safe-or-4 {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.pb-safe-or-4 {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

/* Scanner Active State */
body.scanner-active {
  background: transparent !important;
}

body.scanner-active * {
  visibility: hidden;
}

body.scanner-active .scanner-overlay,
body.scanner-active .scanner-overlay * {
  visibility: visible;
}

/* Touch Optimization */
button,
a,
[role="button"] {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Disable text selection on interactive elements */
button,
.no-select {
  -webkit-user-select: none;
  user-select: none;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Mobile-specific optimizations */
@media (max-width: 768px) {
  /* Prevent zoom on input focus (iOS) */
  input,
  select,
  textarea {
    font-size: 16px !important;
  }
  
  /* Optimize touch targets */
  button,
  a {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Utility Classes */
.bg-primary {
  background-color: var(--primary);
}

.text-primary {
  color: var(--primary);
}

.border-primary {
  border-color: var(--primary);
}

.bg-background-dark {
  background-color: var(--background-dark);
}

.bg-surface-dark {
  background-color: var(--surface-dark);
}

.bg-card-dark {
  background-color: var(--card-dark);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}
```

---

## 📱 Page Scanner QR Intégrée

### src/pages/TicketScanner.tsx

Mettez à jour votre page scanner :

```typescript
// src/pages/TicketScanner.tsx

import React, { useState } from 'react';
import { MobileQRScanner } from '@/components/mobile/MobileQRScanner';
import { SafeArea } from '@/components/SafeArea';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hapticFeedback } from '@/utils/haptics';

export default function TicketScanner() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScanComplete = (result: any) => {
    setScanResult(result);
  };

  const handleClose = async () => {
    await hapticFeedback.light();
    navigate(-1);
  };

  const resetScanner = async () => {
    await hapticFeedback.light();
    setScanResult(null);
  };

  if (scanResult) {
    return (
      <SafeArea className="min-h-screen bg-background-dark">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          {/* Result Icon */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
              scanResult.success
                ? 'bg-green-500/20 border-4 border-green-500'
                : 'bg-red-500/20 border-4 border-red-500'
            }`}
          >
            {scanResult.success ? (
              <CheckCircle size={56} className="text-green-500" />
            ) : (
              <XCircle size={56} className="text-red-500" />
            )}
          </div>

          {/* Result Message */}
          <h2
            className={`text-3xl font-bold mb-2 ${
              scanResult.success ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {scanResult.success ? 'Ticket Valide' : 'Ticket Invalide'}
          </h2>

          <p className="text-gray-400 text-center mb-8">
            {scanResult.message || 'Scan terminé'}
          </p>

          {/* Ticket Details */}
          {scanResult.success && scanResult.data && (
            <div className="w-full max-w-md bg-card-dark rounded-2xl p-6 mb-8 border border-white/10">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-400">Participant</div>
                  <div className="font-bold text-lg">
                    {scanResult.data.member?.firstName}{' '}
                    {scanResult.data.member?.lastName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Ticket</div>
                  <div className="font-mono text-green-500 font-bold text-sm">
                    {scanResult.data.ticketNumber?.slice(-6)}
                  </div>
                </div>
              </div>

              {scanResult.data.seating && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase mb-1">
                      Section
                    </div>
                    <div className="font-bold text-lg">
                      {scanResult.data.seating.section || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase mb-1">
                      Rang / Siège
                    </div>
                    <div className="font-bold text-lg">
                      {scanResult.data.seating.row || 'N/A'} /{' '}
                      {scanResult.data.seating.seat || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <button
            onClick={resetScanner}
            className="w-full max-w-md px-6 py-4 bg-primary text-black rounded-xl font-bold text-lg hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 mb-3"
          >
            Scanner un Autre Ticket
          </button>

          <button
            onClick={handleClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Retour
          </button>
        </div>
      </SafeArea>
    );
  }

  return <MobileQRScanner onScanComplete={handleScanComplete} onClose={handleClose} />;
}
```

---

## ✅ Checklist Étape 2

- [ ] Plugin Barcode Scanner installé
- [ ] MobileQRScanner component créé
- [ ] main.tsx mis à jour avec initialisation Capacitor
- [ ] index.css mis à jour avec styles mobile
- [ ] TicketScanner page mise à jour
- [ ] Tests du scanner sur device/émulateur

---

Voulez-vous que je continue avec :
1. ✅ Les assets (icônes et splash screens)
2. ✅ La configuration Android complète
3. ✅ La configuration iOS complète
4. ✅ Les scripts de build finaux

Prêt pour la suite ? 🚀
