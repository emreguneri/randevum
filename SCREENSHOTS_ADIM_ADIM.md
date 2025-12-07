# Screenshots Hazırlama - Adım Adım Rehber

## 📋 Gerekli Screenshot'lar

### Minimum Gereksinimler:
- **iPhone 6.7" Display:** En az 3 screenshot (1290 x 2796px)
- **iPhone 6.5" Display:** En az 3 screenshot (1284 x 2778px)
- **Toplam:** En az 6 screenshot (her cihaz için 3'er adet)

### Önerilen Screenshot Sırası:
1. **Ana Ekran** (Randevu Al) - İlk görüntü, uygulamanın ana özelliğini gösterir
2. **İşletme Detay** - Randevu alma sürecini gösterir
3. **Randevu Alma** - Kullanıcı deneyimini gösterir
4. **Harita** - Konum bazlı özelliği gösterir
5. **Profil** - Kişiselleştirme özelliğini gösterir

---

## 🚀 Adım 1: iOS Simulator'ı Hazırlama

### 1.1. Simulator'ı Açın

Terminal'de şu komutu çalıştırın:

```bash
npx expo run:ios
```

Veya Simulator'ı manuel olarak açın:

```bash
open -a Simulator
```

### 1.2. Cihaz Seçin

Simulator açıldıktan sonra:
1. **Device** menüsünden **"iPhone 14 Pro Max"** seçin (6.7" Display)
2. Veya **"iPhone 11 Pro Max"** seçin (6.5" Display)

**Not:** Her iki cihaz için de screenshot almanız gerekecek, ama önce birini bitirin.

---

## 📱 Adım 2: Uygulamayı Çalıştırma

### 2.1. Uygulamayı Başlatın

Terminal'de:

```bash
npm start
```

Veya:

```bash
npx expo start
```

### 2.2. Simulator'da Açın

- Expo Go uygulamasını açın (Simulator'da)
- QR kodu tarayın veya otomatik açılacaktır
- Uygulama yüklenecek

---

## 📸 Adım 3: Screenshot Alma

### 3.1. Ana Ekran (Randevu Al) - Screenshot 1

1. Uygulama açıldığında **"Randevu Al"** sekmesinde olmalısınız
2. Ekranda şunlar görünmeli:
   - Arama çubuğu
   - Kategori kartları (Berber, Kuaför, Güzellik Salonu, vb.)
   - İşletme listesi
3. **Screenshot alın:**
   - **Mac:** `Cmd + S`
   - Screenshot otomatik olarak Desktop'a kaydedilir
   - Dosya adı: `Screen Shot [tarih] at [saat].png`

### 3.2. İşletme Detay Ekranı - Screenshot 2

1. Ana ekranda bir işletmeye tıklayın
2. İşletme detay sayfası açılacak
3. Ekranda şunlar görünmeli:
   - İşletme bilgileri (isim, adres, telefon)
   - Hizmetler listesi
   - Yorumlar ve değerlendirmeler
   - "Randevu Al" butonu
4. **Screenshot alın:** `Cmd + S`

### 3.3. Randevu Alma Ekranı - Screenshot 3

1. İşletme detay sayfasında **"Randevu Al"** butonuna tıklayın
2. Randevu alma ekranı açılacak
3. Ekranda şunlar görünmeli:
   - Tarih seçimi
   - Saat seçimi
   - Hizmet seçimi
   - İletişim bilgileri formu
4. **Screenshot alın:** `Cmd + S`

### 3.4. Harita Ekranı - Screenshot 4

1. Alt menüden **"Harita"** sekmesine tıklayın
2. Harita ekranı açılacak
3. Ekranda şunlar görünmeli:
   - Google Maps haritası
   - Yakındaki işletmeler (pin'ler)
   - Konum bazlı arama
4. **Screenshot alın:** `Cmd + S`

### 3.5. Profil Ekranı - Screenshot 5

1. Alt menüden **"Profilim"** sekmesine tıklayın
2. Profil ekranı açılacak
3. Ekranda şunlar görünmeli:
   - Kullanıcı bilgileri
   - Aktif randevular
   - Geçmiş randevular
   - Ayarlar
4. **Screenshot alın:** `Cmd + S`

---

## 🔄 Adım 4: Diğer Cihaz Boyutu İçin Tekrarlama

### 4.1. Cihaz Değiştirin

1. Simulator'da **Device** menüsünden **"iPhone 11 Pro Max"** seçin (6.5" Display)
2. Uygulama otomatik olarak yeniden boyutlanacak

### 4.2. Aynı Ekranlar İçin Screenshot Alın

1. Ana Ekran
2. İşletme Detay
3. Randevu Alma
4. Harita
5. Profil

**Not:** Her cihaz için aynı ekranların screenshot'larını alın.

---

## ✅ Adım 5: Screenshot Kontrolü

### 5.1. Dosyaları Kontrol Edin

Desktop'ta screenshot dosyalarını bulun:
- `Screen Shot [tarih] at [saat].png`
- Toplam 10 screenshot olmalı (her cihaz için 5'er adet)

### 5.2. Boyut Kontrolü

Her screenshot'ın boyutunu kontrol edin:

**iPhone 14 Pro Max (6.7"):**
- **Boyut:** 1290 x 2796px
- **Kontrol:** Finder'da dosyaya sağ tıklayın → "Get Info" → "Dimensions" kontrol edin

**iPhone 11 Pro Max (6.5"):**
- **Boyut:** 1284 x 2778px
- **Kontrol:** Aynı şekilde

### 5.3. Kalite Kontrolü

- ✅ Yüksek çözünürlük (retina)
- ✅ Net ve keskin görüntüler
- ✅ Doğru boyutlar
- ✅ PNG formatı

---

## 📝 Adım 6: Dosya İsimlendirme (Opsiyonel)

Screenshot'ları daha organize etmek için isimlendirebilirsiniz:

### Örnek İsimlendirme:

```
screenshot-1-ana-ekran-6.7.png
screenshot-2-isletme-detay-6.7.png
screenshot-3-randevu-alma-6.7.png
screenshot-4-harita-6.7.png
screenshot-5-profil-6.7.png

screenshot-1-ana-ekran-6.5.png
screenshot-2-isletme-detay-6.5.png
screenshot-3-randevu-alma-6.5.png
screenshot-4-harita-6.5.png
screenshot-5-profil-6.5.png
```

---

## 🎨 Adım 7: Screenshot Düzenleme (Opsiyonel)

### 7.1. Text Overlay (Opsiyonel)

Screenshot'lara açıklayıcı metin ekleyebilirsiniz:
- "Kolay Randevu Alma"
- "Yakındaki İşletmeleri Keşfedin"
- "Hızlı ve Güvenli"

**Not:** Apple, screenshot'larda çok fazla text overlay'i önermez. Minimal tutun.

### 7.2. Düzenleme Araçları

- **Figma:** https://figma.com (ücretsiz)
- **Canva:** https://canva.com (ücretsiz)
- **Photoshop:** (ücretli)
- **GIMP:** (ücretsiz)

---

## 📤 Adım 8: App Store Connect'e Yükleme

### 8.1. App Store Connect'e Gidin

1. **App Store Connect** → **Randevum** uygulamasını açın
2. **"iOS App Version 1.0"** sayfasına gidin
3. **"Previews and Screenshots"** bölümüne gidin

### 8.2. iPhone 6.7" Display İçin Yükleme

1. **"iPhone 6.7" Display"** seçeneğini seçin
2. Screenshot'ları sürükleyip bırakın:
   - En az 3 screenshot
   - İlk 3 screenshot önemli (app installation sheets'te kullanılır)
3. **Sıralamayı düzenleyin:**
   - Ana Ekran → 1. sıra
   - İşletme Detay → 2. sıra
   - Randevu Alma → 3. sıra
   - Harita → 4. sıra
   - Profil → 5. sıra

### 8.3. iPhone 6.5" Display İçin Yükleme

1. **"iPhone 6.5" Display"** seçeneğini seçin
2. Aynı screenshot'ları sürükleyip bırakın
3. Aynı sıralamayı uygulayın

### 8.4. Kaydetme

1. Tüm screenshot'ları yükledikten sonra **"Save"** butonuna tıklayın
2. Başarılı mesajını bekleyin

---

## ✅ Kontrol Listesi

### Screenshot Hazırlama:
- [ ] iOS Simulator açıldı
- [ ] iPhone 14 Pro Max (6.7") seçildi
- [ ] Uygulama çalıştırıldı
- [ ] Ana Ekran screenshot'ı alındı
- [ ] İşletme Detay screenshot'ı alındı
- [ ] Randevu Alma screenshot'ı alındı
- [ ] Harita screenshot'ı alındı
- [ ] Profil screenshot'ı alındı
- [ ] iPhone 11 Pro Max (6.5") seçildi
- [ ] Aynı ekranlar için screenshot'lar alındı
- [ ] Boyutlar kontrol edildi
- [ ] Kalite kontrol edildi

### App Store Connect Yükleme:
- [ ] iPhone 6.7" Display screenshot'ları yüklendi (en az 3 adet)
- [ ] iPhone 6.5" Display screenshot'ları yüklendi (en az 3 adet)
- [ ] Sıralama düzenlendi
- [ ] Kaydedildi

---

## 🆘 Sorun Giderme

### Screenshot Boyutu Yanlış mı?

**Çözüm:**
- Simulator'da doğru cihaz seçildiğinden emin olun
- Screenshot'ları yeniden alın
- Gerekirse Photoshop veya Figma ile boyutlandırın

### Screenshot Bulanık mı?

**Çözüm:**
- Simulator'u yeniden başlatın
- Uygulamayı yeniden yükleyin
- Screenshot'ları yeniden alın

### Uygulama Açılmıyor mu?

**Çözüm:**
```bash
# Terminal'de:
npm start
# Veya
npx expo start
```

---

## 📝 Notlar

- ✅ İlk 3 screenshot çok önemli (app installation sheets'te kullanılır)
- ✅ Screenshot'lar uygulamanın gerçek görünümünü yansıtmalı
- ✅ Text overlay kullanıyorsanız, minimal tutun
- ✅ Frame eklemeyin (Apple önermez)
- ✅ Yüksek kaliteli görüntüler kullanın

---

## 🎯 Hızlı Başlangıç

1. **Simulator'ı açın:**
   ```bash
   npx expo run:ios
   ```

2. **Cihaz seçin:**
   - iPhone 14 Pro Max (6.7")

3. **Uygulamayı çalıştırın:**
   ```bash
   npm start
   ```

4. **Screenshot alın:**
   - Ana Ekran → `Cmd + S`
   - İşletme Detay → `Cmd + S`
   - Randevu Alma → `Cmd + S`
   - Harita → `Cmd + S`
   - Profil → `Cmd + S`

5. **Cihaz değiştirin:**
   - iPhone 11 Pro Max (6.5")

6. **Aynı ekranlar için screenshot alın**

7. **App Store Connect'e yükleyin**

---

## Sonraki Adımlar

1. ✅ Screenshot'ları hazırlayın
2. ✅ App Store Connect'e yükleyin
3. ⏭️ App Icon yükleme
4. ⏭️ Age Ratings (sistem hatası düzeldiğinde)
5. ⏭️ Production build oluşturma
6. ⏭️ Submit for Review

