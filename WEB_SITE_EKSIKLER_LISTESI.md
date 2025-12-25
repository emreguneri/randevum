# Web Sitesi Eksikler ve Güncellemeler Listesi

## ✅ Tamamlanan Özellikler (Mobil ve Web'de Mevcut)

1. ✅ **Aylık abonelik ücreti 800 TL** - Her ikisinde de güncellendi
2. ✅ **Abonelik süresi seçimi (1, 3, 6, 12 ay)** - Her ikisinde de mevcut
3. ✅ **Abonelik uzatma özelliği** - Her ikisinde de mevcut
4. ✅ **Müşteri hesapları için abonelik süresi seçimi** - Her ikisinde de mevcut
5. ✅ **Abonelik bilgileri görüntüleme** - Her ikisinde de mevcut

## ❌ Eksik Özellikler

### 1. Abonelik Ayarları Sayfası
**Durum:** Mobil uygulamada var, web sitesinde yok

**Mobil Uygulama:**
- Yol: `/settings/subscription`
- Özellikler:
  - Mevcut abonelik durumu
  - Kalan gün bilgisi
  - Bitiş tarihi
  - "Aboneliği Uzat" butonu (modal ile süre seçimi)
  - "Aboneliği Yenile" butonu
  - "Aboneliği İptal Et" butonu

**Web Sitesi:**
- Şu anda sadece `/profile` sayfasında abonelik bilgileri var
- Ayrı bir "Abonelik Ayarları" sayfası yok
- Profil sayfasında "Aboneliği Uzat" butonu var ama ayrı bir sayfa yok

**Öneri:** Web sitesine `/customer/subscription` veya `/dashboard/subscription` sayfası eklenebilir.

---

## 🔄 Güncellenmesi Gereken Dosyalar

### 1. Backend - Iyzico Service
**Dosya:** `server/src/services/iyzicoService.js`
**Satır:** 7
**Mevcut:** `const DEFAULT_PLAN_PRICE = process.env.IYZICO_PLAN_PRICE || '99.99';`
**Güncellenmeli:** `const DEFAULT_PLAN_PRICE = process.env.IYZICO_PLAN_PRICE || '800';`

**Not:** Bu bir default değer. Eğer environment variable (`IYZICO_PLAN_PRICE`) set edilmişse onu kullanır. Ama default değer güncellenmeli.

---

### 2. Dokümantasyon Dosyaları

#### a) IYZICO_IS_MODELI_EMAIL.md
**Durum:** Eski fiyatlar (99.99 TL - 499 TL) belirtilmiş
**Güncellenmeli:** 
- Aylık abonelik ücreti: 800 TL
- 3 aylık: 2,160 TL (10% indirim)
- 6 aylık: 4,080 TL (15% indirim)
- 1 yıllık: 7,680 TL (20% indirim)

#### b) IYZICO_PRODUCTION_KURULUM.md
**Durum:** Satır 61'de "Fiyat: 99.99 TL" yazıyor
**Güncellenmeli:** "Fiyat: 800 TL"

#### c) WEB_ODEME_TEST_REHBERI.md
**Durum:** Satır 141'de "99.99 ₺ Öde" butonu bahsedilmiş
**Güncellenmeli:** "800 ₺ Öde" olarak güncellenmeli

---

## 📋 Öncelik Sırası

### Yüksek Öncelik
1. **Backend default fiyat güncellemesi** - Önemli, çünkü environment variable set edilmezse eski fiyat kullanılır
2. **Dokümantasyon güncellemeleri** - Kullanıcılar için doğru bilgi önemli

### Orta Öncelik
3. **Abonelik Ayarları sayfası** - Kullanışlı olur ama şu an profil sayfasında da mevcut

---

## 🔍 Kontrol Edilmesi Gerekenler

1. **Environment Variables:**
   - Backend'de `IYZICO_PLAN_PRICE` environment variable'ı set edilmiş mi?
   - Eğer set edilmişse, değeri 800 olarak güncellenmiş mi?

2. **Iyzico Panel:**
   - Iyzico panelinde abonelik planı fiyatı güncellenmiş mi?
   - Yeni fiyatlandırma planları (3, 6, 12 aylık) oluşturulmuş mu?

3. **Test:**
   - Web sitesinde abonelik satın alma akışı test edildi mi?
   - Fiyatlar doğru görünüyor mu?
   - Ödeme işlemi başarılı oluyor mu?

---

## 📝 Notlar

- Mobil uygulamada olan tüm özellikler web sitesinde de mevcut (abonelik ayarları sayfası hariç)
- Abonelik ayarları sayfası şu an için zorunlu değil, çünkü profil sayfasında tüm özellikler mevcut
- Backend default fiyat güncellemesi önemli, çünkü yeni kurulumlarda eski fiyat kullanılabilir
- Dokümantasyon güncellemeleri kullanıcı deneyimi için önemli

