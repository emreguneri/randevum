# Quick Start - Test Etme Rehberi

## Test Seçenekleri

### Seçenek 1: Expo Go App (Önerilen - Gerçek Telefon)

**Avantajları:**
- Gerçek cihaz deneyimi
- Kolay kurulum
- İki telefonla customer + driver test edebilirsiniz

**Adımlar:**

1. **Telefonunuza Expo Go uygulamasını indirin:**
   - iOS: App Store'dan "Expo Go" indirin
   - Android: Play Store'dan "Expo Go" indirin

2. **Customer App'i başlatın:**
   ```bash
   cd apps/customer
   npm start
   ```
   - Terminal'de QR kod görünecek
   - iOS: Kamera ile QR kodu tarayın
   - Android: Expo Go app'i açın ve "Scan QR code" yapın

3. **Driver App'i başlatın (farklı terminal):**
   ```bash
   cd apps/driver
   npm start
   ```
   - İkinci bir telefonla veya aynı telefonla farklı Expo Go session'ı ile test edebilirsiniz

### Seçenek 2: iOS Simulator (Mac gerekli)

**Adımlar:**

1. **Xcode kurulu olmalı** (App Store'dan ücretsiz)

2. **Customer App:**
   ```bash
   cd apps/customer
   npm start
   ```
   - Terminal'de `i` tuşuna basın (iOS simulator açılır)

3. **Driver App (farklı terminal):**
   ```bash
   cd apps/driver
   npm start
   ```
   - Yeni bir simulator window açın veya `i` tuşuna basın

**Not:** Aynı anda iki simulator çalıştırmak için:
```bash
# İlk simulator
cd apps/customer && npm start
# Terminal'de 'i' bas

# İkinci simulator (yeni terminal)
open -a Simulator  # Yeni simulator window aç
cd apps/driver && npm start
# Terminal'de 'i' bas
```

### Seçenek 3: Android Emulator

**Adımlar:**

1. **Android Studio kurulu olmalı**

2. **Emulator başlatın:**
   - Android Studio > Tools > Device Manager
   - Bir emulator oluşturun/başlatın

3. **Customer App:**
   ```bash
   cd apps/customer
   npm start
   ```
   - Terminal'de `a` tuşuna basın (Android emulator'a yüklenir)

4. **Driver App:**
   - İkinci bir emulator instance başlatın veya farklı terminal'de çalıştırın

### Seçenek 4: Web Browser (Sınırlı)

```bash
cd apps/customer
npm start
# Terminal'de 'w' tuşuna basın
```

**Not:** Web'de bazı özellikler çalışmayabilir (location, push notifications, vb.)

## Backend Bağlantısı

**Önemli:** Mobile app'ler backend'e bağlanabilmeli. Eğer backend `localhost:3000`'de çalışıyorsa:

### Telefon ile test ediyorsanız (Expo Go):

1. **Backend'i local network IP'nizde çalıştırın:**
   ```bash
   # Mac/Linux: IP adresinizi öğrenin
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Backend'i bu IP ile çalıştırın (örnek: 192.168.1.100)
   # services/api/.env dosyasında veya app'lerde API_BASE_URL'i güncelleyin
   ```

2. **Veya ngrok kullanın (kolay yol):**
   ```bash
   # ngrok kurun: npm install -g ngrok
   ngrok http 3000
   # Çıkan URL'i (örn: https://abc123.ngrok.io) kopyalayın
   # apps/customer/src/services/api.ts ve apps/driver/src/services/api.ts'de
   # API_BASE_URL'i bu URL ile değiştirin
   ```

### Simulator/Emulator ile test ediyorsanız:

- `localhost:3000` direkt çalışır (simulator/emulator aynı makinede)

## Hızlı Test Senaryosu

### 1. Backend'i Başlatın
```bash
cd infra && docker-compose up -d
cd services/api
npm run migrate && npm run seed && npm run dev
```

### 2. Customer App (Terminal 1)
```bash
cd apps/customer
npm start
# Expo Go: QR kod tara
# Simulator: 'i' (iOS) veya 'a' (Android) bas
```

### 3. Driver App (Terminal 2)
```bash
cd apps/driver
npm start
# Expo Go: QR kod tara (farklı telefon)
# Simulator: Yeni simulator aç ve 'i' bas
```

### 4. Test Akışı

**Customer App:**
1. Telefon numarası gir: `5551234567`
2. "Kod Gönder" → Backend console'da OTP kodu görünecek (örn: `123456`)
3. OTP kodunu gir → Giriş yap
4. Mode: STANDARD, Time: NOW seç
5. "Trip İste" butonuna bas

**Driver App:**
1. Farklı telefon numarası gir: `5559876543`
2. OTP ile giriş yap
3. "Çevrimiçi Durumu" toggle'ını aç
4. Aktif trip görünecek (eğer matching çalışıyorsa)
5. "Geldim" → "Yolculuğu Başlat" → "Tamamla"

## Sorun Giderme

**Problem: "Network request failed"**
- Backend çalışıyor mu? `curl http://localhost:3000/health`
- API_BASE_URL doğru mu? (telefon için local IP veya ngrok URL)
- Firewall backend portunu engelliyor mu?

**Problem: OTP gelmiyor**
- Backend console'da OTP kodu görünüyor mu? (mock implementation console'a yazdırır)
- Telefon numarası formatı doğru mu?

**Problem: Trip oluşturulamıyor**
- Backend loglarını kontrol edin
- Payment method ID doğru mu? (`mock-payment-method-1`)

**Problem: Driver trip görmüyor**
- Driver online mu? (presence toggle açık mı?)
- Matching servisi çalışıyor mu?
- Backend loglarını kontrol edin

## Önerilen Test Yöntemi

**En kolay:** İki telefon + Expo Go
- Bir telefon customer app
- İkinci telefon driver app
- Backend'i ngrok ile expose edin (veya local network IP kullanın)

**En hızlı:** iOS Simulator (Mac'te)
- İki simulator window açın
- Biri customer, biri driver
- `localhost:3000` direkt çalışır

