# Firebase Kurulum Rehberi

Firebase başarıyla kuruldu! Şimdi yapılandırmanızı tamamlamak için şu adımları izleyin:

## 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Add project" (Proje Ekle) butonuna tıklayın
3. Proje adını girin (örn: "Randevum")
4. Google Analytics'i etkinleştirin (isteğe bağlı)
5. "Create project" (Proje Oluştur) butonuna tıklayın

## 2. Firebase Web App Ekleyin

1. Firebase Console'da projenizi açın
2. Sol menüden ⚙️ (Settings) > "Project settings" seçin
3. Aşağı kaydırın ve "Your apps" bölümünde "Web" (</>) ikonuna tıklayın
4. App nickname: "Randevum" yazın
5. "Register app" butonuna tıklayın
6. Açılan sayfada **config bilgilerinizi** kopyalayın:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

## 3. .env Dosyasını Doldurun

Proje kök dizininde `.env` dosyasını oluşturun ve Firebase config bilgilerinizi ekleyin:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 4. Firebase Servislerini Aktifleştirin

### Authentication (Kimlik Doğrulama)
1. Firebase Console'da "Authentication" > "Get started" seçin
2. "Sign-in method" sekmesine gidin
3. "Email/Password" seçeneğini etkinleştirin

### Firestore Database (Veritabanı)
1. Firebase Console'da "Firestore Database" > "Create database" seçin
2. "Start in test mode" seçin (geliştirme için)
3. Location seçin (örn: europe-west1)
4. "Enable" butonuna tıklayın

### Storage (Dosya Depolama)
1. Firebase Console'da "Storage" > "Get started" seçin
2. "Start in test mode" seçin
3. Location seçin
4. "Done" butonuna tıklayın

## 5. Kullanım Örnekleri

### Authentication Kullanımı
```typescript
import { signUp, signIn, logout, getCurrentUser } from '@/services/firebaseService';

// Yeni kullanıcı kaydı
await signUp('user@example.com', 'password123');

// Giriş yap
await signIn('user@example.com', 'password123');

// Çıkış yap
await logout();

// Mevcut kullanıcıyı al
const user = getCurrentUser();
```

### Firestore Kullanımı
```typescript
import { addDocument, getDocument, updateDocument, getDocuments } from '@/services/firebaseService';

// Döküman ekle
const shopId = await addDocument('shops', {
  name: 'Sevinç Berber',
  address: 'İstanbul',
  category: 'Berber'
});

// Döküman getir
const shop = await getDocument('shops', shopId);

// Döküman güncelle
await updateDocument('shops', shopId, { name: 'Yeni İsim' });

// Tüm dökümanları getir
const shops = await getDocuments('shops');
```

### Storage Kullanımı
```typescript
import { uploadFile, getFileURL } from '@/services/firebaseService';

// Fotoğraf yükle
const file = // Blob veya File objesi
const uploadResult = await uploadFile(`shops/${shopId}/photo.jpg`, file);

// Fotoğraf URL'ini al
const photoURL = await getFileURL(`shops/${shopId}/photo.jpg`);
```

## 6. Güvenlik Kuralları

Firestore ve Storage için güvenlik kurallarını ayarlayın:

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Notlar

- `.env` dosyası `.gitignore`'a eklenmiştir, böylece config bilgileriniz git'e yüklenmez
- Expo projelerinde environment variable'lar `EXPO_PUBLIC_` prefix'i ile başlamalıdır
- Firebase config bilgilerinizi asla public repository'lere yüklemeyin

## Sorun Giderme

- Eğer Firebase bağlantı hatası alıyorsanız, `.env` dosyasının doğru doldurulduğundan emin olun
- Expo development server'ı yeniden başlatın: `npx expo start --clear`
- Firebase Console'da projenizin aktif olduğundan emin olun

