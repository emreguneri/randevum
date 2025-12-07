# Google Maps API Key Yetkilendirme Rehberi

## Hata: "This API project is not authorized to use this API"

Bu hata, API key'inizin Geocoding API ve Maps JavaScript API'yi kullanmasına izin verilmediğini gösterir.

## Çözüm: API Key Restrictions'ı Güncelleme

### Yöntem 1: API Restrictions'ı Kaldırma (Geliştirme için - Önerilen)

1. **Google Cloud Console**'a gidin: https://console.cloud.google.com
2. **APIs & Services** > **Credentials** (Kimlik Bilgileri) seçin
3. API Key'inizi bulun ve üzerine tıklayın
4. **API restrictions** bölümüne gidin
5. **"Don't restrict key"** seçeneğini seçin (geliştirme için)
6. **SAVE** butonuna tıklayın

### Yöntem 2: Sadece Gerekli API'leri İzin Verme (Production için)

1. **Google Cloud Console**'a gidin: https://console.cloud.google.com
2. **APIs & Services** > **Credentials** seçin
3. API Key'inizi bulun ve üzerine tıklayın
4. **API restrictions** bölümüne gidin
5. **"Restrict key"** seçeneğini seçin
6. **Select APIs** dropdown'ından şunları seçin:
   - ✅ **Maps JavaScript API**
   - ✅ **Geocoding API**
7. **SAVE** butonuna tıklayın

### Yöntem 3: Application Restrictions Kontrolü

1. API Key sayfasında **Application restrictions** bölümünü kontrol edin
2. Eğer **"HTTP referrers"** veya başka bir restriction varsa:
   - Geliştirme için: **"None"** seçin
   - Production için: Domain'inizi ekleyin (örn: `localhost:3000`, `randevum.app`)

## Hızlı Linkler

- **API Credentials**: https://console.cloud.google.com/apis/credentials
- **Maps JavaScript API**: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
- **Geocoding API**: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com

## Test

1. API Key ayarlarını kaydettikten sonra **2-3 dakika bekleyin** (değişikliklerin yayılması için)
2. Web sitesini **hard refresh** yapın (Cmd+Shift+R veya Ctrl+Shift+R)
3. Adres sekmesine gidin
4. Harita ve geocoding çalışmalı

## Önemli Notlar

- API restrictions değişiklikleri **2-3 dakika** içinde aktif olur
- Geliştirme aşamasında **"Don't restrict key"** kullanmak daha kolaydır
- Production'da mutlaka **API restrictions** kullanın (güvenlik için)

