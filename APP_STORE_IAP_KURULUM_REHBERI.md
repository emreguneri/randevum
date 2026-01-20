# App Store In-App Purchase (IAP) Kurulum Rehberi

Bu rehber, Randevum uygulamasına App Store IAP entegrasyonunu tamamlamak için gerekli adımları içerir.

## 📋 İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [App Store Connect Yapılandırması](#app-store-connect-yapılandırması)
3. [Subscription Ürünleri Oluşturma](#subscription-ürünleri-oluşturma)
4. [Backend Yapılandırması](#backend-yapılandırması)
5. [Test Etme](#test-etme)
6. [Production'a Geçiş](#productiona-geçiş)

---

## 🔧 Gereksinimler

- ✅ Apple Developer hesabı (yıllık $99)
- ✅ App Store Connect erişimi
- ✅ Uygulama App Store'da yayında
- ✅ Backend sunucusu (receipt validation için)

---

## 📱 App Store Connect Yapılandırması

### 1. App Store Connect'e Giriş

1. [App Store Connect](https://appstoreconnect.apple.com) adresine gidin
2. Apple Developer hesabınızla giriş yapın
3. "My Apps" bölümünden "Randevum" uygulamasını seçin

### 2. In-App Purchase Bölümüne Erişim

1. Uygulama sayfasında sol menüden **"Features"** → **"In-App Purchases"** seçin
2. Sağ üstteki **"+"** butonuna tıklayın

---

## 💳 Subscription Ürünleri Oluşturma

### Subscription Group Oluşturma

1. İlk kez IAP ekliyorsanız, bir **Subscription Group** oluşturmanız gerekir:
   - **Group Name**: "Randevum Abonelik Planları" (veya istediğiniz isim)
   - **Reference Name**: "Randevum Subscriptions"

### Subscription Ürünleri Ekleme

Aşağıdaki 4 subscription ürününü oluşturun:

#### 1. Aylık Abonelik (1 Ay)

- **Type**: Auto-Renewable Subscription
- **Product ID**: `com.happyhour.randevum.subscription.monthly`
- **Reference Name**: "Aylık Abonelik"
- **Subscription Duration**: 1 Month
- **Price**: ₺800.00 (Türkiye için)
- **Display Name**: "Aylık Abonelik"
- **Description**: "Randevum işletme sahibi aylık abonelik planı. Sınırsız randevu yönetimi, müşteri yönetimi ve istatistikler."

#### 2. 3 Aylık Abonelik

- **Type**: Auto-Renewable Subscription
- **Product ID**: `com.happyhour.randevum.subscription.3months`
- **Reference Name**: "3 Aylık Abonelik"
- **Subscription Duration**: 3 Months
- **Price**: ₺2,160.00 (₺800 x 3 x 0.9 = %10 indirim)
- **Display Name**: "3 Aylık Abonelik"
- **Description**: "Randevum işletme sahibi 3 aylık abonelik planı. %10 indirimli fiyat."

#### 3. 6 Aylık Abonelik

- **Type**: Auto-Renewable Subscription
- **Product ID**: `com.happyhour.randevum.subscription.6months`
- **Reference Name**: "6 Aylık Abonelik"
- **Subscription Duration**: 6 Months
- **Price**: ₺4,080.00 (₺800 x 6 x 0.85 = %15 indirim)
- **Display Name**: "6 Aylık Abonelik"
- **Description**: "Randevum işletme sahibi 6 aylık abonelik planı. %15 indirimli fiyat."

#### 4. 12 Aylık Abonelik

- **Type**: Auto-Renewable Subscription
- **Product ID**: `com.happyhour.randevum.subscription.12months`
- **Reference Name**: "12 Aylık Abonelik"
- **Subscription Duration**: 12 Months
- **Price**: ₺7,680.00 (₺800 x 12 x 0.8 = %20 indirim)
- **Display Name**: "12 Aylık Abonelik"
- **Description**: "Randevum işletme sahibi 12 aylık abonelik planı. %20 indirimli fiyat."

### Her Subscription İçin Gerekli Bilgiler

Her subscription ürünü için şunları doldurun:

1. **Subscription Information**:
   - Display Name (Türkçe)
   - Description (Türkçe)
   - Review Information (Apple incelemesi için)

2. **Pricing and Availability**:
   - Her ülke için fiyatlandırma (Türkiye: ₺800, ₺2,160, ₺4,080, ₺7,680)
   - Availability: Tüm ülkeler

3. **Subscription Duration**:
   - 1 Month, 3 Months, 6 Months, 12 Months

4. **Localizations** (Opsiyonel ama önerilir):
   - Türkçe ve İngilizce açıklamalar

---

## 🔐 App-Specific Shared Secret Oluşturma

Receipt validation için bir shared secret oluşturmanız gerekir:

1. App Store Connect'te uygulamanızın sayfasına gidin
2. **"App Information"** → **"App Store"** → **"App-Specific Shared Secret"** bölümüne gidin
3. **"Generate"** butonuna tıklayın
4. Oluşturulan secret'i kopyalayın ve backend environment variable'ına ekleyin:
   ```bash
   APPLE_SHARED_SECRET=your_shared_secret_here
   ```

---

## 🖥️ Backend Yapılandırması

### Environment Variables

Backend `.env` dosyanıza şu değişkeni ekleyin:

```env
APPLE_SHARED_SECRET=your_shared_secret_here
```

### Receipt Validation Endpoint

Backend'de `/api/payments/apple/validate-receipt` endpoint'i zaten oluşturuldu. Bu endpoint:

- Apple'dan gelen receipt'i doğrular
- Abonelik bilgilerini çıkarır
- Kullanıcının abonelik durumunu kontrol eder

---

## 🧪 Test Etme

### Sandbox Test Hesabı Oluşturma

1. App Store Connect'te **"Users and Access"** → **"Sandbox Testers"** bölümüne gidin
2. **"+"** butonuna tıklayın
3. Test kullanıcısı bilgilerini girin:
   - Email (gerçek olmayan bir email)
   - Password
   - Country: Turkey

### Test Adımları

1. **iOS Simulator veya Test Cihazında**:
   - Uygulamayı açın
   - Test kullanıcısı ile App Store'a giriş yapın (Settings → App Store → Sandbox Account)
   - Payment ekranına gidin
   - "App Store ile Öde" butonuna tıklayın
   - Sandbox ortamında ödeme yapın

2. **Backend Loglarını Kontrol Edin**:
   - Receipt validation isteklerini kontrol edin
   - Hata mesajlarını inceleyin

3. **Firestore'u Kontrol Edin**:
   - Kullanıcının `subscriptionStatus` alanının `active` olduğunu doğrulayın
   - `subscriptionProvider` alanının `apple` olduğunu kontrol edin

### Test Senaryoları

- ✅ Yeni abonelik satın alma
- ✅ Abonelik uzatma (extend)
- ✅ Abonelik iptal etme
- ✅ Abonelik yenileme (auto-renewal)
- ✅ Receipt validation hataları

---

## 🚀 Production'a Geçiş

### 1. Subscription Ürünlerini Submit Etme

1. Her subscription ürünü için **"Submit for Review"** butonuna tıklayın
2. Apple'ın incelemesini bekleyin (genellikle 24-48 saat)
3. Onaylandıktan sonra production'da kullanılabilir hale gelir

### 2. Uygulama Güncellemesi

1. IAP entegrasyonunu içeren yeni bir build oluşturun
2. App Store Connect'e yükleyin
3. Test edin
4. Production'a gönderin

### 3. İlk Ödeme Sonrası

İlk ödeme alındığında Apple mali bilgileri isteyecektir:
- Vergi kimlik numarası (VKN)
- Şirket bilgileri
- Banka hesap bilgileri

Bu bilgileri App Store Connect'te **"Payments and Financial Reports"** bölümünden tamamlayın.

---

## 📝 Önemli Notlar

### Product ID'ler

Product ID'ler kodda tanımlı olmalı ve App Store Connect'teki ID'lerle **tam olarak eşleşmelidir**:

```typescript
// services/iapService.ts
export const SUBSCRIPTION_IDS = {
  MONTHLY: 'com.happyhour.randevum.subscription.monthly',
  THREE_MONTHS: 'com.happyhour.randevum.subscription.3months',
  SIX_MONTHS: 'com.happyhour.randevum.subscription.6months',
  TWELVE_MONTHS: 'com.happyhour.randevum.subscription.12months',
};
```

### Receipt Validation

- Production ve Sandbox receipt'leri farklı URL'lerde doğrulanır
- Backend otomatik olarak production'da başarısız olursa sandbox'a yönlendirir
- Receipt validation her zaman backend'de yapılmalıdır (güvenlik için)

### Abonelik Yönetimi

- Apple otomatik olarak abonelikleri yeniler
- Kullanıcılar Settings → App Store → Subscriptions üzerinden iptal edebilir
- İptal edilen abonelikler süre bitene kadar aktif kalır

---

## 🐛 Sorun Giderme

### "Product not found" Hatası

- Product ID'lerin App Store Connect'te oluşturulduğundan emin olun
- Product ID'lerin kodla eşleştiğini kontrol edin
- Subscription'ların "Ready to Submit" durumunda olduğunu doğrulayın

### Receipt Validation Hatası

- `APPLE_SHARED_SECRET` environment variable'ının doğru olduğunu kontrol edin
- Backend loglarını inceleyin
- Sandbox test hesabı kullanıyorsanız, sandbox receipt gönderildiğinden emin olun

### Ödeme Yapılamıyor

- Test cihazında sandbox hesabı ile giriş yapıldığını kontrol edin
- Subscription'ların onaylandığını doğrulayın
- Network bağlantısını kontrol edin

---

## 📞 Destek

Sorularınız için:
- [Apple Developer Support](https://developer.apple.com/support/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

---

## ✅ Kontrol Listesi

- [ ] Subscription Group oluşturuldu
- [ ] 4 subscription ürünü oluşturuldu (1, 3, 6, 12 ay)
- [ ] Product ID'ler kodla eşleşiyor
- [ ] Fiyatlandırma doğru (₺800, ₺2,160, ₺4,080, ₺7,680)
- [ ] App-Specific Shared Secret oluşturuldu
- [ ] Backend `APPLE_SHARED_SECRET` environment variable'ı ayarlandı
- [ ] Sandbox test hesabı oluşturuldu
- [ ] Test ödemesi yapıldı
- [ ] Receipt validation çalışıyor
- [ ] Firestore'da abonelik bilgileri kaydediliyor
- [ ] Production'a gönderildi

---

**Son Güncelleme**: 2024

