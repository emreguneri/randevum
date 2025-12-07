# App Store Screenshots Hazırlık Rehberi

## Gerekli Screenshot Boyutları

### iPhone Screenshots (Zorunlu)

#### 1. iPhone 6.5" Display
- **Boyutlar:**
  - 1242 x 2688px (Portrait)
  - 2688 x 1242px (Landscape)
  - 1284 x 2778px (Portrait)
  - 2778 x 1284px (Landscape)
- **Minimum:** 3 screenshot
- **Maksimum:** 10 screenshot
- **Not:** İlk 3 screenshot app installation sheets'te kullanılır

#### 2. iPhone 6.7" Display (iPhone 14 Pro Max, 15 Pro Max)
- **Boyut:** 1290 x 2796px
- **Minimum:** 3 screenshot
- **Maksimum:** 10 screenshot

#### 3. iPhone 5.5" Display (Opsiyonel)
- **Boyut:** 1242 x 2208px
- **Minimum:** 3 screenshot

### iPad Screenshots (Opsiyonel - Tablet Desteği Varsa)

#### iPad Pro 12.9"
- **Boyut:** 2048 x 2732px
- **Minimum:** 3 screenshot

---

## Screenshot İçerikleri (Önerilen Sıra)

### 1. Ana Ekran (Randevu Al) - İlk Screenshot
- **Ekran:** `app/(tabs)/index.tsx`
- **İçerik:**
  - Arama çubuğu
  - Kategori kartları (Berber, Kuaför, Güzellik Salonu, vb.)
  - İşletme listesi
  - Modern ve temiz görünüm

### 2. Harita Ekranı
- **Ekran:** `app/(tabs)/explore.tsx`
- **İçerik:**
  - Google Maps haritası
  - Yakındaki işletmeler
  - Konum bazlı arama

### 3. İşletme Detay Ekranı
- **Ekran:** `app/shop/[id].tsx`
- **İçerik:**
  - İşletme bilgileri
  - Hizmetler listesi
  - Yorumlar ve değerlendirmeler
  - "Randevu Al" butonu

### 4. Randevu Alma Ekranı
- **Ekran:** `app/booking.tsx`
- **İçerik:**
  - Tarih seçimi
  - Saat seçimi
  - Hizmet seçimi
  - İletişim bilgileri formu

### 5. Profil Ekranı
- **Ekran:** `app/(tabs)/profile.tsx`
- **İçerik:**
  - Kullanıcı bilgileri
  - Aktif randevular
  - Geçmiş randevular
  - İşletme sahibi paneli (varsa)

### 6. Randevularım Ekranı (Opsiyonel)
- **Ekran:** `app/appointments/active.tsx`
- **İçerik:**
  - Aktif randevular listesi
  - Randevu kartları
  - Durum bilgileri

---

## Screenshot Alma Yöntemleri

### Yöntem 1: iOS Simulator (Önerilen)

#### Adımlar:
1. **Simulator'ı açın:**
   ```bash
   npx expo run:ios
   ```
   veya
   ```bash
   open -a Simulator
   ```

2. **Cihaz seçin:**
   - iPhone 14 Pro Max (6.7")
   - iPhone 11 Pro Max (6.5")
   - iPhone 8 Plus (5.5")

3. **Uygulamayı çalıştırın:**
   - Expo Go veya development build
   - İstediğiniz ekrana gidin

4. **Screenshot alın:**
   - **Mac:** `Cmd + S`
   - Screenshot otomatik olarak Desktop'a kaydedilir
   - Dosya adı: `Screen Shot [tarih] at [saat].png`

5. **Boyut kontrolü:**
   - Screenshot'lar genellikle doğru boyutta olur
   - Gerekirse düzenleyin

#### Avantajlar:
- ✅ Hızlı ve kolay
- ✅ Doğru boyutlarda
- ✅ Farklı cihaz boyutlarını test edebilirsiniz
- ✅ Tutarlı görüntüler

---

### Yöntem 2: Gerçek iPhone Cihazı

#### Adımlar:
1. **iPhone'da uygulamayı açın**
2. **Ekran görüntüsü alın:**
   - iPhone X ve üzeri: Power + Volume Up
   - iPhone 8 ve önceki: Power + Home
3. **Fotoğraflar uygulamasından alın**
4. **Boyut kontrolü ve düzenleme:**
   - Gerekirse Photoshop, Figma veya online araçlarla düzenleyin

#### Dezavantajlar:
- ⚠️ Boyut düzenleme gerekebilir
- ⚠️ Daha fazla işlem

---

### Yöntem 3: Design Tool (Figma, Sketch, Photoshop)

#### Adımlar:
1. **Mockup oluşturun:**
   - Figma, Sketch veya Photoshop kullanın
   - iPhone frame template'i kullanın
   - Uygulama ekranlarını mockup olarak oluşturun

2. **Export edin:**
   - Gerekli boyutlarda export edin
   - PNG formatında

#### Avantajlar:
- ✅ Profesyonel görünüm
- ✅ Tutarlı tasarım
- ✅ Text overlay ekleyebilirsiniz

---

## Screenshot Düzenleme İpuçları

### 1. Text Overlay (Opsiyonel)
- Screenshot'lara açıklayıcı metin ekleyebilirsiniz
- Örnek: "Kolay Randevu Alma", "Yakındaki İşletmeleri Keşfedin"
- **Not:** Apple, screenshot'larda çok fazla text overlay'i önermez

### 2. Frame Ekleme (Opsiyonel)
- iPhone frame ekleyebilirsiniz
- Daha profesyonel görünüm
- **Not:** Apple, frame'siz screenshot'ları tercih eder

### 3. Kalite Kontrolü
- ✅ Yüksek çözünürlük (retina)
- ✅ Net ve keskin görüntüler
- ✅ Doğru boyutlar
- ✅ PNG formatı

---

## Screenshot Yükleme Adımları

### App Store Connect'te:

1. **Randevum uygulamasını açın**
2. **"iOS App Version 1.0" sayfasına gidin**
3. **"Previews and Screenshots" bölümüne gidin**
4. **Cihaz seçin:**
   - iPhone 6.5" Display
   - iPhone 6.7" Display
5. **Screenshot'ları sürükleyip bırakın:**
   - En az 3 screenshot
   - İlk 3 screenshot önemli (app installation sheets'te kullanılır)
6. **Sıralamayı düzenleyin:**
   - En önemli screenshot'ları önce koyun
7. **Kaydedin**

---

## Önerilen Screenshot Sırası

1. **Ana Ekran** (Randevu Al) - İlk görüntü, uygulamanın ana özelliğini gösterir
2. **İşletme Detay** - Randevu alma sürecini gösterir
3. **Randevu Alma** - Kullanıcı deneyimini gösterir
4. **Harita** - Konum bazlı özelliği gösterir
5. **Profil** - Kişiselleştirme özelliğini gösterir

---

## Hızlı Başlangıç

### Şimdi Yapılacaklar:

1. **iOS Simulator'ı açın:**
   ```bash
   npx expo run:ios
   ```

2. **Cihaz seçin:**
   - iPhone 14 Pro Max (6.7")

3. **Uygulamayı çalıştırın ve ekranlara gidin**

4. **Screenshot alın:**
   - `Cmd + S` (Mac)
   - Desktop'a kaydedilir

5. **Boyut kontrolü:**
   - Screenshot'ları kontrol edin
   - Gerekirse düzenleyin

6. **App Store Connect'e yükleyin**

---

## Yardımcı Araçlar

### Online Screenshot Düzenleme:
- **Figma:** https://figma.com (ücretsiz)
- **Canva:** https://canva.com (ücretsiz)
- **Remove.bg:** https://remove.bg (arka plan kaldırma)

### Desktop Araçlar:
- **Photoshop** (ücretli)
- **Sketch** (ücretli)
- **GIMP** (ücretsiz)

---

## Notlar

- ✅ İlk 3 screenshot çok önemli (app installation sheets'te kullanılır)
- ✅ Screenshot'lar uygulamanın gerçek görünümünü yansıtmalı
- ✅ Text overlay kullanıyorsanız, minimal tutun
- ✅ Frame eklemeyin (Apple önermez)
- ✅ Yüksek kaliteli görüntüler kullanın

---

## Sonraki Adımlar

1. Screenshot'ları hazırlayın
2. App Store Connect'e yükleyin
3. Metadata'ları doldurun (APP_STORE_LISTING.md'den)
4. Review için gönderin

