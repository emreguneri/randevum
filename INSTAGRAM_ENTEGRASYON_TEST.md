# Instagram Entegrasyonu Test Rehberi

## Test Adımları

### 1. İşletme Sahibi Olarak Giriş Yapın
- Web sitesine gidin: `http://localhost:3000` (veya production URL)
- "Giriş Yap" butonuna tıklayın
- İşletme sahibi hesabınızla giriş yapın (admin rolüne sahip olmalı)

### 2. İşletme Ayarlarına Gidin
- Sağ üst köşedeki "Profilim" butonuna tıklayın
- Dropdown menüden "İşletme Sahibi" bölümünde "Mekan Ekle / Düzenle" seçeneğine tıklayın
- Veya direkt URL: `http://localhost:3000/dashboard/shop`

### 3. Instagram Linkini Ekleyin
- Sayfayı aşağı kaydırın
- "Instagram Profil Linki" alanını bulun
- Instagram profil linkinizi girin:
  - Örnek: `https://instagram.com/behkanailstudio`
  - Veya: `https://www.instagram.com/behkanailstudio/`
- "Kaydet" butonuna tıklayın

### 4. Instagram Entegrasyonu Bölümünü Kontrol Edin
- Kaydetme işleminden sonra, sayfanın üst kısmında "Instagram Entegrasyonu" bölümü görünecek
- Bu bölümde:
  - Randevu linkiniz gösterilecek
  - "Linki Kopyala" butonu olacak
  - Instagram bio ve Stories için kullanım talimatları olacak

### 5. Randevu Sayfasını Test Edin
- "Paylaşılabilir rezervasyon linkiniz" bölümündeki linke tıklayın
- Veya direkt: `http://localhost:3000/book/[slug]` (slug'ınızı kullanın)
- Randevu sayfasında:
  - İşletme bilgileri bölümünde Instagram linki görünmeli
  - "📷 Instagram'da Takip Et" linki olmalı
  - Linke tıklayınca Instagram profil sayfası yeni sekmede açılmalı

### 6. Instagram'da Test Edin
- "Linki Kopyala" butonuna tıklayın
- Kopyalanan linki Instagram bio'nuzda veya Stories'inizde paylaşın
- Linke tıklayarak randevu sayfasının açıldığını doğrulayın

## Test Senaryoları

### ✅ Başarılı Senaryolar
1. **Instagram linki ekleme:**
   - Instagram profil linki başarıyla kaydedilmeli
   - Firestore'da `instagramUrl` field'ı güncellenmeli

2. **Randevu sayfasında görünüm:**
   - Instagram linki işletme bilgilerinde görünmeli
   - Link tıklanabilir olmalı
   - Yeni sekmede açılmalı

3. **Link kopyalama:**
   - "Linki Kopyala" butonu çalışmalı
   - Link panoya kopyalanmalı
   - Başarı mesajı gösterilmeli

### ❌ Hata Senaryoları
1. **Geçersiz link:**
   - Geçersiz URL formatı girildiğinde hata mesajı gösterilmeli
   - Kaydetme işlemi başarısız olmalı

2. **Boş link:**
   - Instagram linki boş bırakılabilir (zorunlu değil)
   - Boş bırakıldığında randevu sayfasında gösterilmemeli

## Firestore Kontrolü

Instagram linkinin kaydedildiğini kontrol etmek için:

1. Firebase Console'a gidin: https://console.firebase.google.com
2. Firestore Database'e gidin
3. `shops` collection'ını açın
4. İşletmenizin dokümanını bulun
5. `instagramUrl` field'ının eklenmiş olduğunu kontrol edin

## Mobil Uygulamada Test

Mobil uygulamada da Instagram linki görünmeli:
- İşletme detay sayfasında Instagram linki gösterilmeli
- Linke tıklayınca Instagram uygulaması açılmalı (eğer yüklüyse)

## Sorun Giderme

### Instagram linki görünmüyor
- İşletme ayarlarından linki eklediğinizden emin olun
- Sayfayı yenileyin (F5)
- Firestore'da `instagramUrl` field'ının olduğunu kontrol edin

### Link kopyalama çalışmıyor
- Tarayıcı konsolunda hata var mı kontrol edin
- HTTPS kullanıyorsanız, clipboard API'si çalışmalı
- HTTP kullanıyorsanız, bazı tarayıcılarda çalışmayabilir

### Instagram sayfası açılmıyor
- Link formatını kontrol edin (https:// ile başlamalı)
- Instagram profil linkinin doğru olduğundan emin olun

