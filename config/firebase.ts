import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Firestore, initializeFirestore } from 'firebase/firestore';


// Firebase yapılandırma bilgilerinizi buraya ekleyin
// Firebase Console'dan (https://console.firebase.google.com/) alabilirsiniz
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

// Debug: Firebase config kontrolü (production'da kaldırılabilir)
if (__DEV__) {
  const hasValidConfig = firebaseConfig.apiKey !== "your-api-key" && 
                         firebaseConfig.projectId !== "your-project-id";
  if (!hasValidConfig) {
    console.warn('⚠️ Firebase config eksik! .env dosyasını kontrol edin.');
  } else {
    console.log('✅ Firebase config yüklendi:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });
  }
}

// Firebase'i initialize et (sadece bir kez)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Firebase servislerini export et
// React Native için AsyncStorage persistence ile auth başlat
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error: any) {
  // Auth zaten initialize edilmişse, mevcut auth'u kullan
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}
export { auth };

const db: Firestore = initializeFirestore(app, {});
export { db };

export default app;

