# Firebase Detaylı Kurulum Rehberi 🔥

Bu rehber, Firebase'i Randevum uygulamanıza entegre etmek için her adımı detaylıca açıklar.

---

## 📋 ADIM 1: Firebase Console'a Giriş Yapın

1. **Tarayıcınızda şu adrese gidin:**
   ```
   https://console.firebase.google.com/
   ```

2. **Google hesabınızla giriş yapın**
   - Eğer Google hesabınız yoksa, önce bir hesap oluşturun

3. **Firebase Console ana sayfasını göreceksiniz**

---

## 📋 ADIM 2: Yeni Firebase Projesi Oluşturun

1. **"Add project" (veya "Proje Ekle") butonuna tıklayın**
   - Ana sayfanın üstünde veya ortasında bulunur

2. **Proje adı girin:**
   - Proje adı: `Randevum`
   - Bu ad sadece Firebase Console'da görünecek

3. **"Continue" (Devam Et) butonuna tıklayın**

4. **Google Analytics (İsteğe Bağlı):**
   - "Enable Google Analytics" seçeneğini açıp kapatabilirsiniz
   - Şimdilik kapalı bırakabilirsiniz
   - "Continue" butonuna tıklayın

5. **Analytics hesabı seçin (eğer aktifse):**
   - Varsayılan hesabı seçin veya yeni hesap oluşturun
   - "Create project" (Proje Oluştur) butonuna tıklayın

6. **Proje oluşturulmasını bekleyin (30-60 saniye)**
   - "Continue" butonuna tıklayın

---

## 📋 ADIM 3: Web Uygulaması Ekleyin

1. **Firebase Console'da projeniz açıldıktan sonra:**
   - Ana ekranda büyük bir ikon görürsünüz: `</>` (Web ikonu)
   - VEYA
   - Sol üstte proje adınızın yanındaki ⚙️ (Settings) ikonuna tıklayın
   - Sonra "Project settings" (Proje Ayarları) seçin

2. **"Project settings" sayfasında:**
   - Aşağı kaydırın
   - "Your apps" (Uygulamalarınız) bölümünü bulun
   - "Web" (`</>`) ikonuna tıklayın

3. **App registration (Uygulama Kaydı) ekranı:**
   - **App nickname:** `Randevum` yazın
   - **Firebase Hosting:** Şimdilik işaretlemeyin (gerek yok)
   - **"Register app" (Uygulamayı Kaydet) butonuna tıklayın**

4. **Config bilgileri ekranı açılacak:**
   - Bu ekranda şu bilgileri göreceksiniz:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "randevum-xxxxx.firebaseapp.com",
     projectId: "randevum-xxxxx",
     storageBucket: "randevum-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdefghijklmnop"
   };
   ```

5. **Bu bilgileri kopyalayın:**
   - Her bir değeri (tırnak işaretleri olmadan) kopyalayın
   - ÖNEMLİ: Tırnak işaretlerini (`"`) kopyalamayın, sadece içerikleri

---

## 📋 ADIM 4: .env Dosyası Oluşturun

1. **Proje klasörünüzü açın:**
   - Terminal'de şu komutu çalıştırın:
   ```bash
   cd /Users/emreguneri/Berber
   ```

2. **.env dosyası oluşturun:**
   - Terminal'de:
   ```bash
   touch .env
   ```
   - VEYA
   - Text editörde (VS Code, TextEdit) yeni dosya oluşturun
   - Dosya adı: `.env` (nokta ile başlamalı)

3. **.env dosyasını açın ve şu içeriği ekleyin:**
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=randevum-xxxxx.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=randevum-xxxxx
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=randevum-xxxxx.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
   ```

4. **Firebase Console'dan kopyaladığınız değerleri yerleştirin:**
   - `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX` → Firebase Console'daki `apiKey` değeri
   - `randevum-xxxxx.firebaseapp.com` → Firebase Console'daki `authDomain` değeri
   - `randevum-xxxxx` → Firebase Console'daki `projectId` değeri
   - `randevum-xxxxx.appspot.com` → Firebase Console'daki `storageBucket` değeri
   - `123456789012` → Firebase Console'daki `messagingSenderId` değeri
   - `1:123456789012:web:abcdefghijklmnop` → Firebase Console'daki `appId` değeri

5. **Dosyayı kaydedin**

**ÖRNEK .env dosyası:**
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCEtk1HSycs-zPTNAQxrkLqBBw45tERfCQ
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=randevum-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=randevum-app-12345
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=randevum-app-12345.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321098
EXPO_PUBLIC_FIREBASE_APP_ID=1:987654321098:web:abc123def456ghi789
```

---

## 📋 ADIM 5: Authentication (Kimlik Doğrulama) Aktifleştirin

1. **Firebase Console'da sol menüden:**
   - "Authentication" (Kimlik Doğrulama) seçeneğine tıklayın

2. **"Get started" (Başlayın) butonuna tıklayın**

3. **"Sign-in method" (Giriş yöntemi) sekmesine tıklayın**

4. **"Email/Password" seçeneğini bulun:**
   - Listede "Email/Password" yazısını bulun
   - Yanındaki ✏️ (düzenle) ikonuna tıklayın

5. **Email/Password'u etkinleştirin:**
   - "Enable" (Etkinleştir) toggle'ını AÇIN
   - "Save" (Kaydet) butonuna tıklayın

6. **"Email/Password" aktif oldu! ✅**

---

## 📋 ADIM 6: Firestore Database (Veritabanı) Oluşturun

1. **Firebase Console'da sol menüden:**
   - "Firestore Database" seçeneğine tıklayın

2. **"Create database" (Veritabanı Oluştur) butonuna tıklayın**

3. **Güvenlik kuralları seçimi:**
   - **"Start in test mode" (Test modunda başlat) seçin**
   - ⚠️ UYARI: Bu mod geliştirme için uygundur, production'da değiştirmeniz gerekir
   - "Next" (İleri) butonuna tıklayın

4. **Location (Konum) seçin:**
   - Önerilen: `europe-west1` (Frankfurt) veya `us-central1` (Iowa)
   - Türkiye'den daha yakın olduğu için `europe-west1` önerilir
   - "Enable" (Etkinleştir) butonuna tıklayın

5. **Veritabanı oluşturulmasını bekleyin (1-2 dakika)**

6. **"Firestore Database" aktif oldu! ✅**

---

## 📋 ADIM 7: Storage (Dosya Depolama) Aktifleştirin

1. **Firebase Console'da sol menüden:**
   - "Storage" (Depolama) seçeneğine tıklayın

2. **"Get started" (Başlayın) butonuna tıklayın**

3. **Güvenlik kuralları seçimi:**
   - **"Start in test mode" (Test modunda başlat) seçin**
   - "Next" (İleri) butonuna tıklayın

4. **Location (Konum) seçin:**
   - Firestore ile aynı location'ı seçin (örn: `europe-west1`)
   - "Done" (Tamam) butonuna tıklayın

5. **Storage aktif oldu! ✅**

---

## 📋 ADIM 8: Development Server'ı Yeniden Başlatın

1. **Terminal'de:**
   - Eğer Expo server çalışıyorsa, `Ctrl+C` ile durdurun

2. **Cache'i temizleyerek yeniden başlatın:**
   ```bash
   cd /Users/emreguneri/Berber
   npx expo start --clear
   ```

3. **Uygulamayı test edin:**
   - iOS Simulator veya fiziksel cihazda uygulamayı açın
   - Firebase bağlantısı çalışıyor olmalı

---

## 🔍 KONTROL LİSTESİ

Kurulum tamamlandı mı kontrol edin:

- [ ] Firebase Console'da proje oluşturuldu
- [ ] Web app eklendi ve config bilgileri kopyalandı
- [ ] `.env` dosyası oluşturuldu ve dolduruldu
- [ ] Authentication → Email/Password aktif
- [ ] Firestore Database oluşturuldu
- [ ] Storage aktifleştirildi
- [ ] Development server yeniden başlatıldı

---

## 🐛 SORUN GİDERME

### "Firebase: Error (auth/invalid-api-key)"
**Çözüm:**
- `.env` dosyasındaki değerleri kontrol edin
- Tırnak işareti olmamalı
- Boşluk olmamalı
- Development server'ı yeniden başlatın

### "Firebase: Error (auth/network-request-failed)"
**Çözüm:**
- İnternet bağlantınızı kontrol edin
- Firebase Console'da projenin aktif olduğundan emin olun

### ".env dosyası çalışmıyor"
**Çözüm:**
- Expo'da environment variable'lar `EXPO_PUBLIC_` ile başlamalı
- Dosya adı tam olarak `.env` olmalı (nokta ile)
- Development server'ı yeniden başlatın

---

## 📚 SONRAKI ADIMLAR

Firebase kurulumu tamamlandıktan sonra:

1. **Authentication kullanımı:**
   - Kullanıcı kayıt/giriş sayfaları oluşturun
   - `services/firebaseService.ts` dosyasındaki `signUp`, `signIn` fonksiyonlarını kullanın

2. **Firestore kullanımı:**
   - Dükkanları, randevuları Firestore'a kaydedin
   - `addDocument`, `getDocument` gibi fonksiyonları kullanın

3. **Storage kullanımı:**
   - Dükkan fotoğraflarını Storage'a yükleyin
   - `uploadFile`, `getFileURL` fonksiyonlarını kullanın

---

## 💡 İPUÇLARI

- `.env` dosyasını asla git'e commit etmeyin (zaten `.gitignore`'da)
- Firebase Console'da projenizi düzenli olarak kontrol edin
- Test modunda güvenlik kuralları çok açık, production'da mutlaka güncelleyin
- Firestore'da veri yapısını planlayın (collections, documents)

---

**Kurulum tamamlandı! Artık Firebase'i kullanmaya başlayabilirsiniz! 🎉**

