# App Information Doldurma Rehberi

## 📍 App Store Connect'te Nerede?

1. **App Store Connect** → **Randevum** uygulamasını açın
2. Sol menüden **"App Information"** seçeneğine tıklayın
3. Şu anda bu sayfadasınız ✅

---

## 📝 Doldurulacak Alanlar

### 1. Localizable Information (Türkçe)

#### Name (Uygulama Adı)
- **Mevcut:** "Randevum" ✅ (Zaten dolu, değiştirmeyin)
- **Karakter limiti:** 30 karakter
- **Durum:** ✅ Tamamlandı

#### Subtitle (Alt Başlık) ⚠️ BOŞ - DOLDURULMALI
- **Yazılacak:** `Randevu Yönetim Platformu`
- **Karakter limiti:** 30 karakter
- **Nereden:** APP_STORE_LISTING.md dosyasından
- **Adımlar:**
  1. "Subtitle" alanına tıklayın
  2. Şunu yazın: `Randevu Yönetim Platformu`
  3. Karakter sayısını kontrol edin (30 karakter içinde olmalı)

#### Language (Dil)
- **Mevcut:** "Turkish" ✅ (Zaten seçili)
- **Durum:** ✅ Tamamlandı

---

### 2. General Information

#### Bundle ID
- **Mevcut:** `com.happyhour.randevum` ✅
- **Durum:** ✅ Tamamlandı (değiştirilemez)

#### SKU
- **Mevcut:** `randevum-001` ✅
- **Durum:** ✅ Tamamlandı (değiştirilemez)

#### Apple ID
- **Mevcut:** `6754814908` ✅
- **Durum:** ✅ Tamamlandı (değiştirilemez)

#### Primary Language
- **Mevcut:** "Turkish" ✅
- **Durum:** ✅ Tamamlandı (değiştirilemez)

#### Category (Kategori) ⚠️ DOLDURULMALI
- **Primary (Birincil):** 
  - Dropdown'a tıklayın
  - **"Business"** seçin
- **Secondary (İkincil - Opsiyonel):**
  - Dropdown'a tıklayın
  - **"Lifestyle"** seçin (opsiyonel ama önerilir)

#### Content Rights (İçerik Hakları) ⚠️ DOLDURULMALI
- **Link:** "Set Up Content Rights Information" linkine tıklayın
- **Sorular:**
  - **"Does your app contain, display, or access third-party content?"**
    - **Cevap:** "No" (Hayır) - Uygulamanız kendi içeriğini kullanıyor
  - **"Does your app use third-party content or services that are subject to the terms of a third-party license agreement?"**
    - **Cevap:** "No" (Hayır)
  - **"Does your app use third-party content or services that require attribution?"**
    - **Cevap:** "No" (Hayır)
- **Kaydedin**

#### Age Ratings (Yaş Sınırları) ⚠️ DOLDURULMALI
- **Buton:** "Set Up Age Ratings" butonuna tıklayın
- **Hedef:** 4+ (Tüm yaşlar için uygun)
- **Detaylı Rehber:** `AGE_RATINGS_DOLDURMA.md` dosyasına bakın
- **Kısa Özet:**
  - **In-App Controls:** Parental Controls: No, Age Assurance: No
  - **Capabilities:** 
    - Unrestricted Web Access: No
    - User-Generated Content: Yes → "Reviews/Ratings"
    - Messaging: No
    - Social Media: Yes → "Instagram", "WhatsApp" (sadece link)
    - Location Sharing: No
  - **Mature Themes:** Tüm sorulara **No**
  - **Medical/Wellness:** Medical Info: No, Health Topics: Maybe → "Beauty/Fitness"
- **Sonuç:** 4+ yaş sınırı alınmalı

---

## ✅ Kontrol Listesi

### Localizable Information:
- [x] Name: "Randevum" (zaten dolu)
- [ ] **Subtitle: "Randevu Yönetim Platformu" (DOLDURULMALI)**
- [x] Language: "Turkish" (zaten seçili)

### General Information:
- [x] Bundle ID: `com.happyhour.randevum` (zaten dolu)
- [x] SKU: `randevum-001` (zaten dolu)
- [x] Apple ID: `6754814908` (zaten dolu)
- [x] Primary Language: "Turkish" (zaten seçili)
- [ ] **Category - Primary: "Business" (SEÇİLMELİ)**
- [ ] **Category - Secondary: "Lifestyle" (SEÇİLMELİ - Opsiyonel)**
- [ ] **Content Rights: Doldurulmalı**
- [ ] **Age Ratings: Doldurulmalı (4+ hedefleniyor)**

---

## 🎯 Şimdi Yapılacaklar

### Adım 1: Subtitle Ekleme
1. App Store Connect → Randevum → App Information
2. "Subtitle" alanına tıklayın
3. Şunu yazın: `Randevu Yönetim Platformu`
4. Enter'a basın veya başka bir alana tıklayın

### Adım 2: Category Seçme
1. "Category" dropdown'ına tıklayın
2. **"Business"** seçin
3. "Secondary (optional)" dropdown'ına tıklayın
4. **"Lifestyle"** seçin (opsiyonel)

### Adım 3: Content Rights
1. "Set Up Content Rights Information" linkine tıklayın
2. Tüm sorulara **"No"** cevabını verin
3. Kaydedin

### Adım 4: Age Ratings
1. "Set Up Age Ratings" butonuna tıklayın
2. **Detaylı rehber için:** `AGE_RATINGS_DOLDURMA.md` dosyasına bakın
3. Tüm kategorileri doldurun:
   - In-App Controls → No, No
   - Capabilities → User-Generated Content: Yes (Reviews/Ratings), Social Media: Yes (Instagram, WhatsApp), diğerleri: No
   - Mature Themes → Tüm sorulara No
   - Medical/Wellness → Medical: No, Health: Maybe → "Beauty/Fitness"
4. Sonuç: **4+** yaş sınırı alınmalı
5. Kaydedin

### Adım 5: Kaydetme
1. Sayfanın sağ üst köşesindeki **"Save"** butonuna tıklayın
2. Başarılı mesajını bekleyin

---

## 📸 Görsel Rehber

### Subtitle Alanı:
```
┌─────────────────────────────────┐
│ Subtitle ?                      │
│ [Randevu Yönetim Platformu]     │ ← Buraya yazın
│ 30                              │ ← Karakter sayısı
└─────────────────────────────────┘
```

### Category Alanı:
```
┌─────────────────────────────────┐
│ Category ?                      │
│ [Business ▼]                    │ ← "Business" seçin
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Secondary (optional)             │
│ [Lifestyle ▼]                   │ ← "Lifestyle" seçin (opsiyonel)
└─────────────────────────────────┘
```

---

## ⚠️ Önemli Notlar

1. **Subtitle zorunlu değil ama önerilir**
   - App Store'da uygulama adının altında görünür
   - 30 karakter limiti var

2. **Category seçimi önemli**
   - Primary category zorunlu
   - Secondary category opsiyonel ama önerilir
   - Arama sonuçlarında görünürlüğü etkiler

3. **Content Rights zorunlu**
   - "Set Up Content Rights Information" linkine tıklamadan submit edilemez
   - Tüm sorulara "No" demek genellikle yeterlidir

4. **Kaydetmeyi unutmayın**
   - Değişiklikler otomatik kaydedilmez
   - "Save" butonuna tıklamayı unutmayın

---

## ✅ Tamamlandığında

App Information doldurulduktan sonra:
1. ✅ Subtitle eklendi
2. ✅ Category seçildi
3. ✅ Content Rights dolduruldu
4. ✅ Age Ratings dolduruldu (4+)
5. ✅ Kaydedildi

**Sonraki adım:** Pricing and Availability ayarlama

---

## 🆘 Sorun Yaşarsanız

- **Subtitle alanı görünmüyor mu?** → Sayfayı yenileyin
- **Category seçenekleri görünmüyor mu?** → Dropdown'a tıklayın
- **Save butonu aktif değil mi?** → Bir değişiklik yapın, aktif olur
- **Content Rights linki çalışmıyor mu?** → Farklı tarayıcı deneyin

