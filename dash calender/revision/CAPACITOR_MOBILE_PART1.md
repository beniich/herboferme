# 📱 FootballHub+ - Configuration Capacitor Mobile Complète

## 🎯 Vue d'Ensemble

Cette configuration transforme votre application React en application mobile native pour iOS et Android avec :
- ✅ Scanner QR natif
- ✅ Push notifications
- ✅ Haptic feedback
- ✅ Partage natif
- ✅ Caméra
- ✅ Status bar
- ✅ Splash screen
- ✅ Network detection
- ✅ Filesystem access

---

## 📦 ÉTAPE 1 : Installation Capacitor (5 min)

```bash
# Aller dans le dossier frontend
cd footballhub-frontend

# Installer Capacitor
npm install @capacitor/core @capacitor/cli

# Initialiser Capacitor
npx cap init

# Informations à fournir :
# App name: FootballHub+
# App ID: com.footballhub.app
# Web directory: dist
```

## 🔌 ÉTAPE 2 : Installer TOUS les Plugins (5 min)

```bash
# Plugins Core
npm install @capacitor/android @capacitor/ios

# Plugins Features
npm install @capacitor/camera
npm install @capacitor/push-notifications
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
npm install @capacitor/keyboard
npm install @capacitor/share
npm install @capacitor/filesystem
npm install @capacitor/app
npm install @capacitor/network
npm install @capacitor/haptics

# Scanner QR (Community Plugin)
npm install @capacitor-community/barcode-scanner
```

---

## ⚙️ ÉTAPE 3 : Configuration capacitor.config.ts

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.footballhub.app',
  appName: 'FootballHub+',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Pour le développement local (décommenter si besoin)
    // url: 'http://localhost:3000',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1A1915',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#F9D406',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1A1915',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
```

---

## 🍎 ÉTAPE 4 : Configuration iOS

### 4.1 Ajouter la Plateforme iOS

```bash
# Build le projet web
npm run build

# Ajouter iOS
npx cap add ios

# Sync avec iOS
npx cap sync ios
```

### 4.2 Configurer Info.plist

```bash
# Ouvrir ios/App/App/Info.plist et ajouter :
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Existant... -->
    
    <!-- Camera Permission -->
    <key>NSCameraUsageDescription</key>
    <string>FootballHub+ a besoin d'accéder à la caméra pour scanner les billets QR</string>
    
    <!-- Photo Library Permission -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>FootballHub+ a besoin d'accéder à vos photos</string>
    
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>FootballHub+ a besoin de sauvegarder des photos</string>
    
    <!-- Location Permission (si besoin) -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>FootballHub+ a besoin de votre position pour trouver des événements près de vous</string>
    
    <!-- Face ID Permission (si besoin) -->
    <key>NSFaceIDUsageDescription</key>
    <string>FootballHub+ utilise Face ID pour sécuriser votre compte</string>
    
    <!-- Status Bar Style -->
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleLightContent</string>
    
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <true/>
    
    <!-- Orientation -->
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    
    <!-- App Transport Security -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
</plist>
```

### 4.3 Configurer Podfile (si besoin)

```bash
cd ios/App
pod install
cd ../..
```

---

## 🤖 ÉTAPE 5 : Configuration Android

### 5.1 Ajouter la Plateforme Android

```bash
# Build le projet web
npm run build

# Ajouter Android
npx cap add android

# Sync avec Android
npx cap sync android
```

### 5.2 Configurer AndroidManifest.xml

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <!-- Push Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

    <!-- Camera features -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
</manifest>
```

### 5.3 Configurer build.gradle

```gradle
// android/app/build.gradle

android {
    namespace "com.footballhub.app"
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.footballhub.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
    
    // Signing config pour release
    signingConfigs {
        release {
            storeFile file("footballhub-release-key.keystore")
            storePassword "footballhub2024"
            keyAlias "footballhub"
            keyPassword "footballhub2024"
        }
    }
}
```

### 5.4 Générer Keystore pour Release

```bash
# Créer le keystore
cd android/app
keytool -genkey -v -keystore footballhub-release-key.keystore -alias footballhub -keyalg RSA -keysize 2048 -validity 10000

# Informations à fournir :
# Password: footballhub2024
# First and Last Name: FootballHub
# Organizational Unit: Development
# Organization: FootballHub
# City: Casablanca
# State: MA
# Country Code: MA

cd ../..
```

---

## 🔧 ÉTAPE 6 : Utilitaires Capacitor

### 6.1 Détection de Plateforme

```typescript
// src/utils/platform.ts
import { Capacitor } from '@capacitor/core';

export const isNative = () => {
  return Capacitor.isNativePlatform();
};

export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};

export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

export const isWeb = () => {
  return Capacitor.getPlatform() === 'web';
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

// API URL selon la plateforme
export const getApiUrl = () => {
  if (isNative()) {
    // Production API
    return 'https://api.footballhub.ma';
  } else {
    // Development API
    return 'http://localhost:5000';
  }
};
```

### 6.2 Haptic Feedback

```typescript
// src/utils/haptics.ts
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNative } from './platform';

export const hapticFeedback = {
  async light() {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },

  async medium() {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  },

  async heavy() {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  },

  async selection() {
    if (isNative()) {
      await Haptics.selectionStart();
      setTimeout(() => Haptics.selectionEnd(), 100);
    }
  },

  async notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (isNative()) {
      await Haptics.notification({ type: type.toUpperCase() as any });
    }
  },

  async vibrate(duration: number = 200) {
    if (isNative()) {
      await Haptics.vibrate({ duration });
    }
  },
};
```

### 6.3 Scanner QR Code

```typescript
// src/utils/qrScanner.ts
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { isNative } from './platform';

export const qrScanner = {
  async checkPermission() {
    if (!isNative()) return { granted: false };

    const status = await BarcodeScanner.checkPermission({ force: true });
    return status;
  },

  async requestPermission() {
    if (!isNative()) return { granted: false };

    const status = await BarcodeScanner.checkPermission({ force: true });
    
    if (status.granted) {
      return { granted: true };
    }

    if (status.denied) {
      // User denied permission
      return { granted: false, denied: true };
    }

    if (status.neverAsked || status.restricted) {
      // Ask for permission
      const newStatus = await BarcodeScanner.checkPermission({ force: true });
      return { granted: newStatus.granted };
    }

    return { granted: false };
  },

  async startScan(): Promise<string | null> {
    if (!isNative()) {
      console.log('QR Scanner only works on mobile');
      return null;
    }

    // Check permission
    const permission = await this.requestPermission();
    if (!permission.granted) {
      throw new Error('Permission refusée');
    }

    // Prepare scanner
    await BarcodeScanner.prepare();

    // Hide background
    document.body.classList.add('qr-scanner-active');

    // Start scanning
    const result = await BarcodeScanner.startScan();

    // Show background
    document.body.classList.remove('qr-scanner-active');

    if (result.hasContent) {
      return result.content;
    }

    return null;
  },

  async stopScan() {
    if (!isNative()) return;

    await BarcodeScanner.stopScan();
    document.body.classList.remove('qr-scanner-active');
  },

  async openSettings() {
    if (!isNative()) return;

    await BarcodeScanner.openAppSettings();
  },
};

// Add CSS for QR Scanner
const style = document.createElement('style');
style.innerHTML = `
  body.qr-scanner-active {
    --background: transparent;
    --ion-background-color: transparent;
  }
  
  body.qr-scanner-active .app-content {
    display: none;
  }
`;
document.head.appendChild(style);
```

Suite dans le prochain fichier avec Push Notifications, Status Bar, et tous les composants React ! 🚀
