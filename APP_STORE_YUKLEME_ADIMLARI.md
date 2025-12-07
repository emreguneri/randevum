# App Store'a Yükleme - Yapılacaklar Listesi

## ✅ Tamamlananlar

1. ✅ Privacy Policy sayfası oluşturuldu (`web/src/app/privacy/page.tsx`)
2. ✅ Terms of Service sayfası oluşturuldu (`web/src/app/terms/page.tsx`)
3. ✅ App Store listing metinleri hazırlandı (`APP_STORE_LISTING.md`)
4. ✅ App Icon hazırlandı ve kopyalandı (`assets/images/icon.png`)
5. ✅ App Store Connect hesabı kontrol edildi (Randevum uygulaması mevcut)
6. ✅ Screenshots hazırlık rehberi oluşturuldu (`SCREENSHOTS_HAZIRLIK.md`)

---

## 📋 Yapılacaklar (Sırayla)

### 1. Domain Aktif Olmasını Bekleme
- **Durum:** Domain kayıt işlemi kuyrukta (`randevum.tr`)
- **Beklenen süre:** 1-24 saat
- **Yapılacak:** Domain aktif olduğunda devam edilecek

---

### 2. Web Sitesini Deploy Etme (Vercel)

#### 2.1. GitHub Repository Hazırlama
- [ ] Web sitesi kodunu GitHub'a push edin
- [ ] Repository'yi public veya private yapın (Vercel için)

#### 2.2. Vercel'e Deploy
- [ ] Vercel hesabı oluşturun (https://vercel.com)
- [ ] GitHub repository'yi Vercel'e bağlayın
- [ ] Environment variables ekleyin:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Deploy edin
- [ ] Domain'i Vercel'e bağlayın (`randevum.tr`)

#### 2.3. URL'leri Test Etme
- [ ] `https://randevum.tr` çalışıyor mu?
- [ ] `https://randevum.tr/privacy` çalışıyor mu?
- [ ] `https://randevum.tr/terms` çalışıyor mu?

---

### 3. App Store Connect - App Information Doldurma

#### 3.1. Localizable Information
- [ ] **Name:** "Randevum" (zaten dolu)
- [ ] **Subtitle:** "Randevu Yönetim Platformu" (APP_STORE_LISTING.md'den)
- [ ] **Language:** Turkish (zaten seçili)

#### 3.2. General Information
- [ ] **Category - Primary:** "Business" seçin
- [ ] **Category - Secondary:** "Lifestyle" seçin (opsiyonel)
- [ ] **Content Rights:** "Set Up Content Rights Information" linkine tıklayın ve doldurun

---

### 4. App Store Connect - Pricing and Availability

- [ ] **Price:** "Free" seçin
- [ ] **Availability:** "All countries" seçin
- [ ] Kaydedin

---

### 5. App Store Connect - Version Information

#### 5.1. Description (Açıklama)
- [ ] App Store Connect → Randevum → iOS App Version 1.0
- [ ] "Description" alanına `APP_STORE_LISTING.md`'deki açıklamayı kopyalayın
- [ ] Maksimum 4000 karakter

#### 5.2. Keywords (Arama Kelimeleri)
- [ ] "Keywords" alanına `APP_STORE_LISTING.md`'deki keywords'leri kopyalayın
- [ ] Maksimum 100 karakter, virgülle ayrılmış

#### 5.3. Support URL
- [ ] `https://randevum.tr` (domain aktif olduktan sonra)
- [ ] Veya geçici olarak: `support@randevum.tr` (e-posta)

#### 5.4. Marketing URL (Opsiyonel)
- [ ] `https://randevum.tr` (domain aktif olduktan sonra)

#### 5.5. Privacy Policy URL
- [ ] `https://randevum.tr/privacy` (domain aktif olduktan sonra)
- [ ] **ZORUNLU:** Bu URL olmadan submit edilemez

---

### 6. Screenshots Hazırlama

#### 6.1. Screenshot Alma
- [ ] iOS Simulator'ı açın (`npx expo run:ios`)
- [ ] iPhone 14 Pro Max (6.7") seçin
- [ ] Uygulamayı çalıştırın
- [ ] Şu ekranlardan screenshot alın:
  1. Ana Ekran (Randevu Al)
  2. İşletme Detay Ekranı
  3. Randevu Alma Ekranı
  4. Harita Ekranı
  5. Profil Ekranı
- [ ] Her screenshot için `Cmd + S` (Mac)

#### 6.2. Screenshot Boyutları
- [ ] iPhone 6.7": 1290 x 2796px (en az 3 adet)
- [ ] iPhone 6.5": 1284 x 2778px (en az 3 adet)
- [ ] Screenshot'ları kontrol edin (boyut, kalite)

#### 6.3. Screenshot Yükleme
- [ ] App Store Connect → Randevum → iOS App Version 1.0
- [ ] "Previews and Screenshots" bölümüne gidin
- [ ] iPhone 6.7" Display seçin
- [ ] Screenshot'ları sürükleyip bırakın (en az 3 adet)
- [ ] iPhone 6.5" Display için de aynısını yapın
- [ ] Sıralamayı düzenleyin (en önemli screenshot'ları önce koyun)

---

### 7. App Icon Yükleme

- [ ] App Store Connect → Randevum → App Information
- [ ] "App Icon" bölümüne gidin
- [ ] `assets/images/icon.png` dosyasını yükleyin (1024x1024px)
- [ ] Icon'un doğru yüklendiğini kontrol edin

---

### 8. App Review Information

#### 8.1. Contact Information
- [ ] **First Name:** Emre
- [ ] **Last Name:** Güneri
- [ ] **Phone Number:** +90 [telefon numaranız]
- [ ] **Email:** [e-posta adresiniz]

#### 8.2. Demo Account (Gerekirse)
- [ ] Test hesabı bilgileri ekleyin (gerekirse)
- [ ] Örnek: `test@randevum.tr` / `Test123!`

#### 8.3. Notes (Opsiyonel)
- [ ] Apple'a özel notlar ekleyin (gerekirse)

---

### 9. App Privacy (Zorunlu)

- [ ] App Store Connect → Randevum → App Privacy
- [ ] Veri toplama türlerini belirtin:
  - Konum bilgileri (Yakındaki işletmeleri göstermek için)
  - Kişisel bilgiler (Randevu bilgileri için)
  - Kullanım verileri (Analitik için)
- [ ] Her veri türü için kullanım amacını belirtin

---

### 10. Production Build Oluşturma

#### 10.1. EAS CLI Girişi
- [ ] Terminal'de: `eas login`
- [ ] Apple ID ile giriş yapın

#### 10.2. Production Build
- [ ] Terminal'de: `eas build --platform ios --profile production`
- [ ] Build süreci 15-30 dakika sürebilir
- [ ] Build tamamlandığında `.ipa` dosyası hazır olur

#### 10.3. Build Kontrolü
- [ ] Build başarılı mı?
- [ ] Hata var mı? (varsa düzeltin)

---

### 11. App Store'a Submit Etme

#### 11.1. Build Yükleme
- [ ] App Store Connect → Randevum → iOS App Version 1.0
- [ ] "Build" bölümüne gidin
- [ ] "+" butonuna tıklayın
- [ ] EAS build'den gelen build'i seçin

#### 11.2. Son Kontroller
- [ ] Tüm metadata doldurulmuş mu?
- [ ] Screenshots yüklenmiş mi?
- [ ] Privacy Policy URL çalışıyor mu?
- [ ] Support URL çalışıyor mu?
- [ ] App Icon yüklenmiş mi?
- [ ] App Privacy doldurulmuş mu?

#### 11.3. Submit for Review
- [ ] "Add for Review" butonuna tıklayın
- [ ] Son kontrolleri yapın
- [ ] "Submit for Review" butonuna tıklayın
- [ ] Onaylayın

---

### 12. Review Süreci

- [ ] Apple review süreci başlar (1-3 gün)
- [ ] E-posta bildirimleri alırsınız
- [ ] Gerekirse Apple'dan geri bildirim gelir
- [ ] Onaylandığında App Store'da yayınlanır

---

## ⚠️ Önemli Notlar

### Domain Beklerken Yapılabilecekler:
- ✅ App Information doldurma (Subtitle, Category)
- ✅ Pricing and Availability ayarlama
- ✅ Screenshots hazırlama
- ✅ App Icon yükleme
- ✅ App Privacy doldurma
- ✅ Production build oluşturma

### Domain Aktif Olduktan Sonra:
- ⏳ Privacy Policy URL güncelleme
- ⏳ Support URL güncelleme
- ⏳ Web sitesini deploy etme
- ⏳ Final submit

---

## 🎯 Öncelik Sırası

1. **Şimdi yapılabilir:**
   - App Information doldurma
   - Pricing and Availability ayarlama
   - Screenshots hazırlama
   - App Privacy doldurma

2. **Domain aktif olduktan sonra:**
   - Web sitesini deploy etme
   - URL'leri güncelleme
   - Production build
   - Submit

---

## 📝 Kontrol Listesi

### App Store Connect:
- [ ] App Information dolduruldu
- [ ] Pricing and Availability ayarlandı
- [ ] Description yazıldı
- [ ] Keywords eklendi
- [ ] Screenshots yüklendi (en az 3 adet)
- [ ] App Icon yüklendi
- [ ] Support URL eklendi
- [ ] Privacy Policy URL eklendi (domain aktif olduktan sonra)
- [ ] App Privacy dolduruldu
- [ ] App Review Information dolduruldu

### Teknik:
- [ ] Production build oluşturuldu
- [ ] Build App Store Connect'e yüklendi
- [ ] Tüm kontroller yapıldı
- [ ] Submit for Review yapıldı

---

## 🚀 Hızlı Başlangıç

**Şimdi yapılacaklar (domain beklerken):**
1. App Information → Subtitle ekle
2. App Information → Category seç
3. Pricing and Availability → Free seç
4. Screenshots hazırla
5. App Privacy doldur

**Domain aktif olduktan sonra:**
1. Web sitesini Vercel'e deploy et
2. URL'leri güncelle
3. Production build yap
4. Submit et

