# Google Maps API Key Setup

## Android için Google Maps Kurulumu

### 1. Google Cloud Console'da API Key Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. Sol menüden **APIs & Services** > **Credentials** seçin
4. **+ CREATE CREDENTIALS** > **API Key** tıklayın
5. API Key'inizi kopyalayın

### 2. Maps SDK'larını Etkinleştirme

1. Sol menüden **APIs & Services** > **Library** seçin
2. Aşağıdaki API'ları arayıp etkinleştirin:
   - **Maps SDK for Android**
   - **Maps SDK for iOS** (isteğe bağlı, iOS zaten Apple Maps kullanıyor)

### 3. API Key'i Kısıtlama (Önerilen)

1. Oluşturduğunuz API Key'e tıklayın
2. **Application restrictions** bölümünde:
   - Android için: **Android apps** seçin
   - Package name: `com.happyhour.randevum`
   - SHA-1 certificate fingerprint ekleyin

SHA-1 fingerprint almak için:
```bash
cd android
./gradlew signingReport
```

### 4. API Key'i Projeye Ekleme

`app.json` dosyasını açın ve API key'inizi ekleyin:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "BURAYA_API_KEY_YAPIŞTIRIN"
    }
  }
}
```

### 5. Rebuild

API key ekledikten sonra:

```bash
# Android için
npx expo prebuild --platform android --clean
npx expo run:android

# veya development build için
npx expo start
```

## Şu Anki Durum

- **iOS**: Apple Maps kullanılıyor (API key gerektirmez) ✅
- **Android**: Google Maps için API key gerekiyor ⚠️

Demo API key: `AIzaSyDemoKeyForDevelopment` (sadece geliştirme için)

## Test Etme

1. Android emulator veya cihazda çalıştırın
2. Harita sekmesine gidin
3. Konumunuzu görmek için konum izni verin
4. 3 örnek dükkan marker'ı haritada görünecek

## Sorun Giderme

### Harita görünmüyorsa:
1. API key'in doğru olduğundan emin olun
2. Maps SDK for Android'in etkinleştirildiğini kontrol edin
3. Package name'in doğru olduğunu kontrol edin
4. Billing hesabının aktif olduğundan emin olun (Google Cloud)

### Konum çalışmıyorsa:
1. Android Manifest'te konum izinlerinin olduğunu kontrol edin
2. Cihaz ayarlarından konum servislerinin açık olduğunu kontrol edin
3. Uygulama ayarlarından konum izninin verildiğini kontrol edin

