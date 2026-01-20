# App Store IAP Entegrasyonu - Sonraki Adımlar

## ✅ Şu An Yapılması Gerekenler (Sırayla)

### 1. Değişiklikleri Commit ve Push Et
```bash
git add .
git commit -m "feat: App Store IAP entegrasyonu eklendi - iOS için native ödeme desteği"
git push origin main
```

### 2. Backend Environment Variable Ekle

Backend sunucunuzun `.env` dosyasına şunu ekleyin:
```env
APPLE_SHARED_SECRET=buraya_app_store_connect_ten_alinacak_secret
```

**Not:** Bu secret'i henüz almadıysanız, önce App Store Connect'te oluşturmanız gerekiyor (3. adım).

### 3. App Store Connect'te Subscription Ürünleri Oluştur

**ÖNEMLİ:** Bu adım olmadan IAP çalışmaz!

1. [App Store Connect](https://appstoreconnect.apple.com) → Randevum uygulaması
2. **Features** → **In-App Purchases** → **+** butonu
3. **Subscription Group** oluştur: "Randevum Abonelik Planları"
4. Aşağıdaki 4 subscription ürününü oluştur:

#### Subscription 1: Aylık
- **Product ID**: `com.happyhour.randevum.subscription.monthly`
- **Duration**: 1 Month
- **Price**: ₺800.00

#### Subscription 2: 3 Aylık
- **Product ID**: `com.happyhour.randevum.subscription.3months`
- **Duration**: 3 Months
- **Price**: ₺2,160.00

#### Subscription 3: 6 Aylık
- **Product ID**: `com.happyhour.randevum.subscription.6months`
- **Duration**: 6 Months
- **Price**: ₺4,080.00

#### Subscription 4: 12 Aylık
- **Product ID**: `com.happyhour.randevum.subscription.12months`
- **Duration**: 12 Months
- **Price**: ₺7,680.00

**Detaylı adımlar için:** `APP_STORE_IAP_KURULUM_REHBERI.md` dosyasına bakın.

### 4. App-Specific Shared Secret Oluştur

1. App Store Connect → Randevum uygulaması
2. **App Information** → **App Store** → **App-Specific Shared Secret**
3. **Generate** butonuna tıklayın
4. Oluşturulan secret'i kopyalayın
5. Backend `.env` dosyasına ekleyin (2. adım)

### 5. Yeni iOS Build Oluştur

`react-native-iap` native modül olduğu için yeni bir build gerekli:

```bash
eas build --platform ios --profile production
```

veya development build için:
```bash
eas build --platform ios --profile development
```

### 6. Sandbox Test Hesabı Oluştur

1. App Store Connect → **Users and Access** → **Sandbox Testers**
2. **+** butonuna tıklayın
3. Test kullanıcısı bilgilerini girin (gerçek olmayan email)

### 7. Test Et

1. Yeni build'i cihaza yükleyin
2. iOS Settings → App Store → Sandbox Account ile test hesabına giriş yapın
3. Uygulamada Payment ekranına gidin
4. "App Store ile Öde" butonuna tıklayın
5. Sandbox ortamında ödeme yapın
6. Backend loglarını kontrol edin

---

## ⚠️ Önemli Notlar

1. **Product ID'ler kritik:** App Store Connect'teki Product ID'ler kodla **tam olarak** eşleşmeli
2. **Native build gerekli:** Expo Go'da çalışmaz, development build veya production build gerekir
3. **Test önce:** Production'a geçmeden önce mutlaka sandbox'ta test edin
4. **Backend gerekli:** Receipt validation için backend çalışıyor olmalı

---

## 📋 Kontrol Listesi

- [ ] Değişiklikler commit edildi ve push edildi
- [ ] Backend `.env` dosyasına `APPLE_SHARED_SECRET` eklendi
- [ ] App Store Connect'te Subscription Group oluşturuldu
- [ ] 4 subscription ürünü oluşturuldu (1, 3, 6, 12 ay)
- [ ] Product ID'ler kodla eşleşiyor
- [ ] App-Specific Shared Secret oluşturuldu ve backend'e eklendi
- [ ] Yeni iOS build oluşturuldu
- [ ] Sandbox test hesabı oluşturuldu
- [ ] Test ödemesi yapıldı ve çalışıyor

---

## 🆘 Sorun mu var?

- **"Product not found" hatası:** Product ID'leri kontrol edin, App Store Connect'te oluşturulduğundan emin olun
- **Receipt validation hatası:** `APPLE_SHARED_SECRET` doğru mu kontrol edin
- **Ödeme yapılamıyor:** Sandbox hesabı ile giriş yaptığınızdan emin olun

