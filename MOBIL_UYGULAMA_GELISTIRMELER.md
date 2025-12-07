# Mobil Uygulama Geliştirmeleri - Web ile Senkronizasyon

Web sitesinde yaptığımız değişiklikleri mobil uygulamaya da uygulamak için yapılması gerekenler:

## 1. ✅ Yorumlar Sistemi (Firestore Reviews)

**Durum:** Web'de var, mobilde yok

**Yapılacaklar:**
- `app/shop/[id].tsx` - Shop detail sayfasına yorumlar sekmesi ekle
- Firestore `reviews` koleksiyonundan yorumları oku
- Yorum yazma formu ekle (rating + yorum)
- Ortalama rating hesaplama ve güncelleme
- Yorumları listeleme (en yeni önce)

**Dosyalar:**
- `app/shop/[id].tsx` - Yorumlar sekmesi ve yorum yazma
- Firestore `reviews` koleksiyonu kullanımı

---

## 2. ✅ Personel Seçimi

**Durum:** Web'de var, mobilde yok

**Yapılacaklar:**
- `app/admin/shop-info.tsx` - Personel yönetimi ekle (ekle/kaldır)
- `app/booking.tsx` - Personel seçimi dropdown'ı ekle
- "Fark Etmez" seçeneği ekle
- Personel bilgisini randevuya kaydet (`staff` field'ı)

**Dosyalar:**
- `app/admin/shop-info.tsx` - Personel ekleme/kaldırma UI
- `app/booking.tsx` - Personel seçimi dropdown

---

## 3. ⚠️ Tarih Seçimi Butonları (Bugün/Yarın)

**Durum:** Web'de var, mobilde yok

**Yapılacaklar:**
- `app/booking.tsx` - Tarih seçimi bölümüne "Bugün" ve "Yarın" butonları ekle
- Butonlar tıklandığında ilgili tarihi seç
- Seçili tarihi görsel olarak vurgula

**Dosyalar:**
- `app/booking.tsx` - Tarih seçimi butonları

---

## 4. ⚠️ 4 Adımlı Süreç Göstergesi

**Durum:** Web'de var, mobilde yok

**Yapılacaklar:**
- `app/booking.tsx` - Randevu formunun üstüne adım göstergesi ekle
- 4 adım: 1. Hizmet, 2. Personel, 3. Tarih, 4. Saat
- Her adımın tamamlanma durumunu göster (aktif/pasif)
- Görsel olarak adımları bağlayan çizgiler

**Dosyalar:**
- `app/booking.tsx` - Adım göstergesi komponenti

---

## 5. ✅ Instagram Entegrasyonu

**Durum:** Web'de var, mobilde yok

**Yapılacaklar:**
- `app/admin/shop-info.tsx` - Instagram URL input field'ı ekle
- `app/shop/[id].tsx` - Instagram linkini göster (tıklanabilir)
- Instagram icon'u ekle

**Dosyalar:**
- `app/admin/shop-info.tsx` - Instagram URL field
- `app/shop/[id].tsx` - Instagram link gösterimi

---

## 6. ✅ Location Field (Geocoding)

**Durum:** Web'de var (shop settings'de otomatik), mobilde yok

**Yapılacaklar:**
- `app/admin/shop-info.tsx` - Adres kaydedilirken otomatik geocoding yap
- `location` field'ını Firestore'a kaydet
- Geocoding başarısız olursa sessizce devam et

**Dosyalar:**
- `app/admin/shop-info.tsx` - Geocoding fonksiyonu ve location kaydetme

---

## 7. ⚠️ Staff Field'ı Shop Info'da

**Durum:** Web'de var, mobilde yok

**Yapılacaklar:**
- `app/admin/shop-info.tsx` - Staff array'ini Firestore'a kaydet
- Staff ekleme/kaldırma UI'ı ekle
- Staff field'ını yükleme fonksiyonuna ekle

**Dosyalar:**
- `app/admin/shop-info.tsx` - Staff yönetimi

---

## 8. ✅ Shop Data Yükleme - Staff ve Instagram

**Durum:** Web'de var, mobilde eksik

**Yapılacaklar:**
- `app/shop/[id].tsx` - `staff` ve `instagramUrl` field'larını yükle
- `app/booking.tsx` - `staff` field'ını yükle
- `app/(tabs)/index.tsx` - Shop data'ya `staff` ve `instagramUrl` ekle (gerekirse)

**Dosyalar:**
- `app/shop/[id].tsx` - Staff ve Instagram field'larını yükle
- `app/booking.tsx` - Staff field'ını yükle

---

## Öncelik Sıralaması

### Yüksek Öncelik
1. **Personel Seçimi** - Randevu akışı için önemli
2. **Instagram Entegrasyonu** - Sosyal medya entegrasyonu
3. **Location Field** - Harita için gerekli

### Orta Öncelik
4. **Yorumlar Sistemi** - Müşteri güveni için önemli
5. **Staff Field Shop Info** - İşletme yönetimi için

### Düşük Öncelik (UX İyileştirmeleri)
6. **Tarih Seçimi Butonları** - Hızlı erişim
7. **4 Adımlı Süreç Göstergesi** - Daha net UX

---

## Notlar

- Tüm değişiklikler Firestore ile senkronize olmalı
- Web'deki veri modeli ile uyumlu olmalı
- AsyncStorage sadece cache için kullanılmalı, gerçek kaynak Firestore olmalı
- Personel seçimi zorunlu değil, "Fark Etmez" seçeneği olmalı

