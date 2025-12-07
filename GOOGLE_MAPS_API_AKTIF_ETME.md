# Google Maps JavaScript API Aktif Etme Rehberi

## Hata: ApiNotActivatedMapError

Bu hata, Google Maps JavaScript API'nin Google Cloud Console'da aktif edilmediğini gösterir.

## Çözüm Adımları

### 1. Google Cloud Console'a Giriş Yapın

1. **Google Cloud Console**'a gidin: https://console.cloud.google.com
2. Giriş yapın (Google hesabınızla)

### 2. Doğru Projeyi Seçin

1. Üst kısımdaki **proje seçici**'ye tıklayın
2. Projenizi seçin (eğer proje yoksa, yeni bir proje oluşturun)
3. Proje adı genellikle Firebase proje adınızla aynıdır: **randevum-66b5e**

### 3. Maps JavaScript API'yi Aktif Edin

1. Sol menüden **"APIs & Services"** > **"Library"** (veya **"API Library"**) seçin
2. Arama kutusuna **"Maps JavaScript API"** yazın
3. **"Maps JavaScript API"** sonucuna tıklayın
4. **"ENABLE"** (Etkinleştir) butonuna tıklayın
5. API aktif edilene kadar bekleyin (birkaç saniye sürebilir)

### 4. Gerekirse Diğer API'leri de Aktif Edin

Aşağıdaki API'ler de gerekebilir (geocoding için):
- **Geocoding API** - Adres → koordinat dönüşümü için
- **Places API** - Yer arama için (opsiyonel)

Bu API'leri de aynı şekilde aktif edin:
1. **APIs & Services** > **Library**
2. Arama kutusuna **"Geocoding API"** yazın
3. **"ENABLE"** butonuna tıklayın

### 5. API Key Kontrolü

1. **APIs & Services** > **Credentials** (Kimlik Bilgileri) seçin
2. API Key'inizin listede olduğundan emin olun
3. API Key'in **API restrictions** (API kısıtlamaları) ayarlarını kontrol edin:
   - **"Don't restrict key"** seçili olabilir (geliştirme için)
   - Veya **"Restrict key"** seçip sadece **"Maps JavaScript API"** ve **"Geocoding API"** seçin

### 6. Billing (Faturalandırma) Kontrolü

⚠️ **Önemli**: Google Maps API kullanımı için **billing account** (faturalandırma hesabı) bağlı olmalıdır.

1. **Billing** (Faturalandırma) menüsüne gidin
2. Eğer billing account yoksa, bir tane bağlayın
3. Google Maps API'ler için **ücretsiz kullanım kotası** vardır:
   - Maps JavaScript API: Ayda 28,000 map load ücretsiz
   - Geocoding API: Ayda 40,000 request ücretsiz

### 7. Test Edin

1. Web sitesini yenileyin (hard refresh: Cmd+Shift+R veya Ctrl+Shift+R)
2. Adres sekmesine gidin
3. Harita görünmeli

## Hızlı Linkler

- **Google Cloud Console**: https://console.cloud.google.com
- **Maps JavaScript API**: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
- **Geocoding API**: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
- **API Credentials**: https://console.cloud.google.com/apis/credentials

## Sorun Giderme

### Hata devam ediyorsa:

1. **API Key doğru mu?** - `.env.local` dosyasında API key'in doğru olduğundan emin olun
2. **Proje doğru mu?** - Firebase projenizle aynı Google Cloud projesini kullandığınızdan emin olun
3. **Billing aktif mi?** - Billing account bağlı olmalı
4. **Tarayıcı cache'i temizleyin** - Hard refresh yapın
5. **Console'da başka hata var mı?** - Tarayıcı console'unu kontrol edin

## Notlar

- API aktif etme işlemi **anında** etkili olur
- Billing account bağlamak **ücretsizdir** (sadece kullanım limitlerini aşarsanız ücret alınır)
- Geliştirme aşamasında ücretsiz kotayı aşmanız pek olası değildir

