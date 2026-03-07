# 📱 FootballHub+ - Capacitor Mobile PART 2 (FINAL)

## 🔔 Push Notifications Setup

### 7.1 Configuration Firebase (iOS & Android)

```typescript
// src/utils/pushNotifications.ts
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { isNative } from './platform';

export const pushNotifications = {
  async register() {
    if (!isNative()) {
      console.log('Push notifications only work on mobile');
      return;
    }

    // Request permission
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    // Register with Apple / Google
    await PushNotifications.register();

    // Listen for registration
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      
      // Send token to backend
      await this.sendTokenToBackend(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listen for push notifications
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
        
        // Show local notification or update UI
        this.handleNotification(notification);
      }
    );

    // Listen for notification actions
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: any) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        
        // Navigate to appropriate screen
        this.handleNotificationAction(notification);
      }
    );
  },

  async sendTokenToBackend(token: string) {
    try {
      const authToken = localStorage.getItem('token');
      
      await fetch(`${getApiUrl()}/api/auth/update-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ pushToken: token }),
      });

      console.log('✅ Push token sent to backend');
    } catch (error) {
      console.error('Error sending token:', error);
    }
  },

  handleNotification(notification: PushNotificationSchema) {
    // Show toast or update badge
    console.log('Notification received:', notification.title, notification.body);
    
    // You can dispatch a custom event here
    window.dispatchEvent(
      new CustomEvent('pushNotification', { detail: notification })
    );
  },

  handleNotificationAction(notification: any) {
    const data = notification.notification.data;
    
    // Navigate based on notification type
    switch (data.type) {
      case 'match_start':
        window.location.href = `/matches/${data.matchId}`;
        break;
      case 'goal':
        window.location.href = `/matches/${data.matchId}`;
        break;
      case 'match_result':
        window.location.href = `/matches/${data.matchId}`;
        break;
      default:
        window.location.href = '/';
    }
  },

  async getDeliveredNotifications() {
    if (!isNative()) return [];

    const notificationList = await PushNotifications.getDeliveredNotifications();
    return notificationList.notifications;
  },

  async removeDeliveredNotifications() {
    if (!isNative()) return;

    await PushNotifications.removeAllDeliveredNotifications();
  },
};
```

---

## 🎨 Status Bar & Splash Screen

### 8.1 Status Bar Control

```typescript
// src/utils/statusBar.ts
import { StatusBar, Style } from '@capacitor/status-bar';
import { isNative } from './platform';

export const statusBar = {
  async setDark() {
    if (!isNative()) return;

    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1A1915' });
  },

  async setLight() {
    if (!isNative()) return;

    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
  },

  async hide() {
    if (!isNative()) return;

    await StatusBar.hide();
  },

  async show() {
    if (!isNative()) return;

    await StatusBar.show();
  },

  async setOverlaysWebView(overlay: boolean) {
    if (!isNative()) return;

    await StatusBar.setOverlaysWebView({ overlay });
  },
};
```

### 8.2 Splash Screen Control

```typescript
// src/utils/splashScreen.ts
import { SplashScreen } from '@capacitor/splash-screen';
import { isNative } from './platform';

export const splashScreen = {
  async show() {
    if (!isNative()) return;

    await SplashScreen.show({
      showDuration: 2000,
      autoHide: true,
    });
  },

  async hide() {
    if (!isNative()) return;

    await SplashScreen.hide();
  },
};
```

---

## 📷 Composant Scanner QR React

```typescript
// src/components/QRScanner.tsx
import React, { useState, useEffect } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { qrScanner } from '@/utils/qrScanner';
import { hapticFeedback } from '@/utils/haptics';
import { isNative } from '@/utils/platform';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!isNative()) {
      setError('Le scanner QR fonctionne uniquement sur mobile');
      return;
    }

    startScanning();

    return () => {
      qrScanner.stopScan();
    };
  }, []);

  const startScanning = async () => {
    try {
      setScanning(true);
      setError(null);
      
      await hapticFeedback.light();

      // Check permission
      const permission = await qrScanner.checkPermission();
      
      if (!permission.granted) {
        setPermissionDenied(true);
        setError('Permission caméra requise');
        return;
      }

      // Start scan
      const result = await qrScanner.startScan();

      if (result) {
        await hapticFeedback.notification('success');
        onScan(result);
        onClose();
      } else {
        setError('Aucun QR code détecté');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'Erreur lors du scan');
      await hapticFeedback.notification('error');
    } finally {
      setScanning(false);
    }
  };

  const handleClose = async () => {
    await hapticFeedback.light();
    await qrScanner.stopScan();
    onClose();
  };

  const handleOpenSettings = async () => {
    await hapticFeedback.light();
    await qrScanner.openSettings();
  };

  if (!isNative()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
        <div className="bg-surface-dark rounded-2xl p-6 max-w-sm w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white text-center mb-2">
            Non Disponible
          </h3>
          <p className="text-gray-400 text-center mb-6">
            Le scanner QR fonctionne uniquement sur l'application mobile
          </p>
          <button
            onClick={handleClose}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-8 right-6 z-10 p-3 bg-black/50 backdrop-blur-md rounded-full"
      >
        <X size={24} className="text-white" />
      </button>

      {/* Scanner Frame */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-72 h-72">
          {/* Corner Borders */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-2xl" />

          {/* Scanning Line */}
          {scanning && (
            <div className="absolute inset-x-0 h-1 bg-primary animate-scan" />
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center justify-center mb-4">
          <Camera size={32} className="text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white text-center mb-2">
          Scanner le QR Code
        </h3>
        <p className="text-gray-400 text-center">
          Placez le QR code dans le cadre pour le scanner
        </p>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-xl">
            <p className="text-red-500 text-center text-sm">{error}</p>
            {permissionDenied && (
              <button
                onClick={handleOpenSettings}
                className="mt-3 w-full py-2 bg-red-500 text-white font-bold rounded-lg"
              >
                Ouvrir les Paramètres
              </button>
            )}
          </div>
        )}
      </div>

      {/* CSS for scan animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
```

---

## 🎯 Composant SafeArea

```typescript
// src/components/SafeArea.tsx
import React, { useEffect, useState } from 'react';
import { SafeArea as CapSafeArea } from '@capacitor/core';
import { isIOS, isNative } from '@/utils/platform';

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
}

export const SafeArea: React.FC<SafeAreaProps> = ({ children, className = '' }) => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    if (isIOS() && isNative()) {
      // iOS has notch/home indicator
      setSafeArea({
        top: 44, // Status bar height
        right: 0,
        bottom: 34, // Home indicator height
        left: 0,
      });
    }
  }, []);

  return (
    <div
      className={className}
      style={{
        paddingTop: safeArea.top,
        paddingRight: safeArea.right,
        paddingBottom: safeArea.bottom,
        paddingLeft: safeArea.left,
      }}
    >
      {children}
    </div>
  );
};
```

---

## 📤 Composant Share Button

```typescript
// src/components/ShareButton.tsx
import React from 'react';
import { Share2 } from 'lucide-react';
import { Share } from '@capacitor/share';
import { hapticFeedback } from '@/utils/haptics';
import { isNative } from '@/utils/platform';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url,
  className = '',
}) => {
  const handleShare = async () => {
    await hapticFeedback.light();

    if (isNative()) {
      try {
        await Share.share({
          title,
          text,
          url,
          dialogTitle: 'Partager',
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      // Web fallback
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
        } catch (error) {
          console.error('Web share error:', error);
        }
      } else {
        // Copy to clipboard fallback
        navigator.clipboard.writeText(url || text);
        alert('Lien copié !');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors ${className}`}
    >
      <Share2 size={18} />
      <span className="text-sm font-medium">Partager</span>
    </button>
  );
};
```

---

## 📱 App.tsx avec Capacitor

```typescript
// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { statusBar } from './utils/statusBar';
import { splashScreen } from './utils/splashScreen';
import { pushNotifications } from './utils/pushNotifications';
import { isNative } from './utils/platform';

function App() {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    if (isNative()) {
      // Set status bar
      await statusBar.setDark();

      // Hide splash screen after app is ready
      setTimeout(async () => {
        await splashScreen.hide();
      }, 1000);

      // Register push notifications
      try {
        await pushNotifications.register();
      } catch (error) {
        console.error('Push notification error:', error);
      }

      // Handle back button (Android)
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
      });

      // Handle app state changes
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });

      // Handle deep links
      CapacitorApp.addListener('appUrlOpen', (event) => {
        const slug = event.url.split('.app').pop();
        if (slug) {
          window.location.href = slug;
        }
      });
    }
  };

  return (
    <BrowserRouter>
      {/* Your app routes */}
    </BrowserRouter>
  );
}

export default App;
```

---

## 🔨 Build Scripts

### package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    
    "cap:sync": "npm run build && npx cap sync",
    "cap:sync:ios": "npm run build && npx cap sync ios",
    "cap:sync:android": "npm run build && npx cap sync android",
    
    "cap:open:ios": "npx cap open ios",
    "cap:open:android": "npx cap open android",
    
    "cap:run:ios": "npm run build && npx cap sync ios && npx cap run ios",
    "cap:run:android": "npm run build && npx cap sync android && npx cap run android",
    
    "cap:build:ios": "npm run build && npx cap sync ios && npx cap build ios",
    "cap:build:android": "npm run build && npx cap sync android && npx cap build android",
    
    "cap:update": "npx cap update"
  }
}
```

---

## 🚀 Commandes de Développement

```bash
# 1. Développement Web
npm run dev

# 2. Build et Sync
npm run cap:sync

# 3. Ouvrir Xcode (iOS)
npm run cap:open:ios

# 4. Ouvrir Android Studio (Android)
npm run cap:open:android

# 5. Run sur iOS
npm run cap:run:ios

# 6. Run sur Android
npm run cap:run:android

# 7. Build pour production
npm run cap:build:ios
npm run cap:build:android
```

---

## ✅ Checklist Mobile Complète

### Configuration
- [ ] Capacitor installé
- [ ] Plugins installés
- [ ] capacitor.config.ts configuré
- [ ] iOS ajouté
- [ ] Android ajouté

### iOS
- [ ] Info.plist configuré
- [ ] Permissions ajoutées
- [ ] Icons & Splash screens
- [ ] Pods installés

### Android
- [ ] AndroidManifest.xml configuré
- [ ] Permissions ajoutées
- [ ] Keystore généré
- [ ] Icons & Splash screens

### Utils
- [ ] platform.ts créé
- [ ] haptics.ts créé
- [ ] qrScanner.ts créé
- [ ] pushNotifications.ts créé
- [ ] statusBar.ts créé

### Components
- [ ] QRScanner composant
- [ ] SafeArea composant
- [ ] ShareButton composant
- [ ] App.tsx configuré

### Build
- [ ] Scripts package.json
- [ ] Test iOS
- [ ] Test Android

---

## 🎉 CAPACITOR 100% COMPLÉTÉ !

**Votre app mobile est maintenant prête avec :**
- ✅ Scanner QR natif
- ✅ Push notifications
- ✅ Haptic feedback
- ✅ Status bar control
- ✅ Safe area handling
- ✅ Native sharing
- ✅ Build scripts

**Prochaine étape ? Frontend React complet ! 🚀**
