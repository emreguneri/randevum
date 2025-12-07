# TestFlight Kurulum Rehberi

## Adım 1: EAS Projesini Yapılandır
```bash
eas build:configure
```
Otomatik proje oluşturmayı onayla.

## Adım 2: App Store Connect'te Uygulama Oluştur

1. https://appstoreconnect.apple.com adresine git
2. "My Apps" → "+" → "New App"
3. Formu doldur:
   - **Name**: Randevum
   - **Primary Language**: Turkish
   - **Bundle ID**: com.happyhour.randevum (eğer yoksa önce Apple Developer Portal'da oluştur)
   - **SKU**: randevum-001
   - **User Access**: Full Access

## Adım 3: iOS Build Başlat

### TestFlight için Production Build:
```bash
eas build --platform ios --profile production
```

Bu komut:
- Uygulamayı bulutta build eder (20-30 dakika sürebilir)
- Build tamamlandığında otomatik olarak App Store Connect'e yüklenir
- TestFlight'a otomatik eklenir

## Adım 4: TestFlight'ta Yayınla

Build tamamlandıktan sonra:

1. App Store Connect → Randevum → TestFlight sekmesine git
2. Build'i seç
3. "Submit for Review" butonuna tıkla
4. Beta Review bilgilerini doldur (genellikle 1-2 saat içinde onaylanır)

## Alternatif: Otomatik Submit

Build tamamlandıktan sonra otomatik submit için:
```bash
eas submit --platform ios --latest
```

## Önemli Notlar

- İlk build için Apple Developer hesabı ve sertifikalar gerekli
- Build sırasında EAS otomatik olarak sertifikaları yönetir
- TestFlight beta test için App Store incelemesi gerektirir (genellikle hızlıdır)
- Internal Testing için inceleme gerekmez

## Troubleshooting

### Build hatası alırsan:
```bash
eas build --platform ios --profile production --clear-cache
```

### Sertifika sorunu varsa:
EAS otomatik olarak yönetir, ancak manuel kontrol için:
```bash
eas credentials
```

