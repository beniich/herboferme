# 📱 Transformation Capacitor - Étape par Étape

## 🔧 Étape 1 : Configuration Initiale

### 1.1 Installation des Dépendances

Ajoutez ceci à votre `package.json` :

```json
{
  "name": "footballhub-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    "android": "npm run build && npx cap sync android && npx cap open android",
    "android:run": "npm run build && npx cap sync android && npx cap run android",
    "android:live": "npx cap run android -l --external",
    
    "ios": "npm run build && npx cap sync ios && npx cap open ios",
    "ios:run": "npm run build && npx cap sync ios && npx cap run ios",
    "ios:live": "npx cap run ios -l --external",
    
    "sync": "npx cap sync",
    "copy": "npx cap copy"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0",
    
    "@capacitor/core": "^5.6.0",
    "@capacitor/android": "^5.6.0",
    "@capacitor/ios": "^5.6.0",
    "@capacitor/camera": "^5.0.9",
    "@capacitor/push-notifications": "^5.1.1",
    "@capacitor/status-bar": "^5.0.7",
    "@capacitor/splash-screen": "^5.0.7",
    "@capacitor/keyboard": "^5.0.8",
    "@capacitor/share": "^5.0.7",
    "@capacitor/filesystem": "^5.2.1",
    "@capacitor/app": "^5.0.7",
    "@capacitor/haptics": "^5.0.7",
    "@capacitor/network": "^5.0.7",
    "@capacitor-community/barcode-scanner": "^4.0.1"
  },
  "devDependencies": {
    "@capacitor/cli": "^5.6.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
```

### 1.2 Installer les Dépendances

```bash
npm install
```

---

## ⚙️ Étape 2 : Configuration Capacitor

### 2.1 capacitor.config.ts

Créez le fichier à la racine :

```typescript
// capacitor.config.ts

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.footballhub.app',
  appName: 'FootballHub+',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Pour développement avec hot reload
    // url: 'http://192.168.1.X:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1A1915',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#F9D406',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1A1915',
    },
    Keyboard: {
      resize: 'native',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
```

### 2.2 Vite Configuration pour Capacitor

Mettez à jour `vite.config.js` :

```javascript
// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Important pour Capacitor live reload
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
  },
});
```

---

## 📱 Étape 3 : Utilitaires Capacitor

### 3.1 Détection de Plateforme

Créez `src/utils/platform.ts` :

```typescript
// src/utils/platform.ts

import { Capacitor } from '@capacitor/core';

export const Platform = {
  isNative: () => Capacitor.isNativePlatform(),
  isWeb: () => !Capacitor.isNativePlatform(),
  isAndroid: () => Capacitor.getPlatform() === 'android',
  isIOS: () => Capacitor.getPlatform() === 'ios',
  getPlatform: () => Capacitor.getPlatform(),
};

export const { isNative, isWeb, isAndroid, isIOS, getPlatform } = Platform;
```

### 3.2 Configuration API

Créez `src/config/api.ts` :

```typescript
// src/config/api.ts

import { Capacitor } from '@capacitor/core';

export const API_CONFIG = {
  // URL de base selon la plateforme
  baseURL: Capacitor.isNativePlatform()
    ? 'https://api.footballhub.com' // Production
    : 'http://localhost:5000/api',   // Développement
  
  timeout: 10000,
  
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getApiUrl = () => API_CONFIG.baseURL;
```

### 3.3 Initialisation App

Créez `src/utils/capacitor-init.ts` :

```typescript
// src/utils/capacitor-init.ts

import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard, KeyboardStyle } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { isNative } from './platform';

export async function initializeCapacitor() {
  if (!isNative()) return;

  try {
    // Status Bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1A1915' });

    // Keyboard
    await Keyboard.setStyle({ style: KeyboardStyle.Dark });
    await Keyboard.setResizeMode({ mode: 'native' });

    // Hide Splash après initialisation
    await SplashScreen.hide();

    // App Listeners
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
    });

    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    // Network Listener
    Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed', status);
      // Vous pouvez ajouter une notification à l'utilisateur
      if (!status.connected) {
        // Afficher un message "Pas de connexion"
      }
    });

    console.log('✅ Capacitor initialized successfully');
  } catch (error) {
    console.error('❌ Capacitor initialization error:', error);
  }
}

// Vérifier l'état du réseau
export async function checkNetworkStatus() {
  const status = await Network.getStatus();
  return status.connected;
}
```

### 3.4 Notifications Push

Créez `src/utils/push-notifications.ts` :

```typescript
// src/utils/push-notifications.ts

import { 
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed 
} from '@capacitor/push-notifications';
import { isNative } from './platform';

export async function initPushNotifications() {
  if (!isNative()) {
    console.log('Push notifications only available on native platforms');
    return;
  }

  try {
    // Demander la permission
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    // Enregistrer pour les notifications
    await PushNotifications.register();

    // Listener pour le token
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token:', token.value);
      // TODO: Envoyer le token au backend
      sendTokenToBackend(token.value);
    });

    // Listener pour les erreurs
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration:', error);
    });

    // Notification reçue (app en foreground)
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received:', notification);
        // Afficher une notification locale ou un toast
      }
    );

    // Notification cliquée
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed:', notification);
        // Naviguer vers la page appropriée
        handleNotificationClick(notification);
      }
    );

    console.log('✅ Push notifications initialized');
  } catch (error) {
    console.error('❌ Push notifications error:', error);
  }
}

async function sendTokenToBackend(token: string) {
  try {
    // TODO: Implémenter l'appel API
    const response = await fetch(`${API_CONFIG.baseURL}/push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    console.log('Token sent to backend:', await response.json());
  } catch (error) {
    console.error('Error sending token:', error);
  }
}

function handleNotificationClick(notification: ActionPerformed) {
  // Router vers la page appropriée basé sur les data de la notification
  const data = notification.notification.data;
  
  if (data.type === 'ticket') {
    window.location.href = `/tickets/${data.ticketId}`;
  } else if (data.type === 'event') {
    window.location.href = `/events/${data.eventId}`;
  } else if (data.type === 'order') {
    window.location.href = `/orders/${data.orderId}`;
  }
}
```

### 3.5 Haptics (Vibration)

Créez `src/utils/haptics.ts` :

```typescript
// src/utils/haptics.ts

import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNative } from './platform';

export const hapticFeedback = {
  light: async () => {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },

  medium: async () => {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  },

  heavy: async () => {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  },

  success: async () => {
    if (isNative()) {
      await Haptics.notification({ type: 'SUCCESS' });
    }
  },

  warning: async () => {
    if (isNative()) {
      await Haptics.notification({ type: 'WARNING' });
    }
  },

  error: async () => {
    if (isNative()) {
      await Haptics.notification({ type: 'ERROR' });
    }
  },

  selection: async () => {
    if (isNative()) {
      await Haptics.selectionStart();
      setTimeout(() => Haptics.selectionEnd(), 100);
    }
  },
};

// Usage dans les composants
// import { hapticFeedback } from '@/utils/haptics';
// 
// <button onClick={() => {
//   hapticFeedback.light();
//   handleClick();
// }}>
//   Click Me
// </button>
```

---

## 🎨 Étape 4 : Composants Mobile

### 4.1 Safe Area Component

Créez `src/components/SafeArea.tsx` :

```typescript
// src/components/SafeArea.tsx

import React from 'react';
import { isNative } from '@/utils/platform';

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  className = '',
  top = true,
  bottom = true,
  left = true,
  right = true,
}) => {
  if (!isNative()) {
    return <div className={className}>{children}</div>;
  }

  const safeAreaClasses = [
    top && 'pt-safe',
    bottom && 'pb-safe',
    left && 'pl-safe',
    right && 'pr-safe',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${safeAreaClasses} ${className}`}>
      {children}
    </div>
  );
};

// Ajouter au globals.css
// .pt-safe { padding-top: env(safe-area-inset-top); }
// .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
// .pl-safe { padding-left: env(safe-area-inset-left); }
// .pr-safe { padding-right: env(safe-area-inset-right); }
```

### 4.2 Share Button Component

Créez `src/components/ShareButton.tsx` :

```typescript
// src/components/ShareButton.tsx

import React from 'react';
import { Share } from '@capacitor/share';
import { Share2 } from 'lucide-react';
import { isNative } from '@/utils/platform';
import { hapticFeedback } from '@/utils/haptics';

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
      // Utiliser le share natif sur mobile
      try {
        await Share.share({
          title,
          text,
          url: url || window.location.href,
          dialogTitle: 'Partager',
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      // Fallback pour web
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
        } catch (error) {
          console.error('Web share error:', error);
        }
      } else {
        // Copier dans le clipboard
        navigator.clipboard.writeText(url || window.location.href);
        alert('Lien copié !');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 ${className}`}
    >
      <Share2 size={20} />
      <span>Partager</span>
    </button>
  );
};
```

---

## 📝 Fichier de Documentation des Changements

J'ai créé la configuration initiale complète. Voulez-vous que je continue avec :

1. Le Scanner QR mobile natif
2. Les modifications du main.tsx pour initialiser Capacitor
3. Les assets (icônes et splash screens)
4. La configuration Android complète
5. La configuration iOS complète

Dites-moi par quoi vous voulez que je continue ! 🚀
