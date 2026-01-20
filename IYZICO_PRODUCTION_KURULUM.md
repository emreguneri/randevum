# iyzico Production Hesabı ve API Anahtarları Alma Rehberi

Bu rehber, iyzico production (canlı) hesabı oluşturma ve API anahtarlarını alma sürecini açıklar.

## 📋 Önkoşullar

- iyzico'da merchant hesabı olmalı (Sanal POS hesabı)
- Subscription API özelliği aktif olmalı (iyzico desteğinden talep edilmiş olmalı)

## 🔐 Adım 1: iyzico Production Paneline Giriş

1. Tarayıcınızda [iyzico Merchant Panel](https://merchant.iyzipay.com/) adresine gidin
2. **Production (Canlı)** hesabınızla giriş yapın
   - **Önemli:** Sandbox (Test) panelinden farklıdır
   - Eğer production hesabınız yoksa, iyzico müşteri hizmetleri ile iletişime geçin

## 🔑 Adım 2: API Anahtarlarını Alma

### 2.1. API Anahtarları Sayfasına Erişim

1. iyzico panelinde sol menüden **"Ayarlar"** (Settings) seçeneğine tıklayın
2. **"API Anahtarları"** (API Keys) veya **"Entegrasyon"** (Integration) sekmesine gidin
3. **"API Key"** ve **"Secret Key"** bilgilerinizi görüntüleyin

### 2.2. API Anahtarlarını Kopyalama

- **API Key:** Uzun bir string (örn: `sandbox-xxxxx` veya `xxxxx`)
- **Secret Key:** Daha uzun bir string (güvenlik nedeniyle gizli tutulmalı)

**⚠️ Güvenlik Uyarısı:**
- Bu anahtarları asla herkese açık bir yere (GitHub, kod paylaşımı, vb.) yüklemeyin
- Sadece `.env` dosyasında saklayın ve `.gitignore`'a ekleyin

## 📦 Adım 3: Subscription API Aktivasyonu Kontrolü

1. iyzico panelinde **"Ürünler"** (Products) veya **"Abonelikler"** (Subscriptions) bölümüne gidin
2. Subscription API özelliğinin aktif olduğundan emin olun
3. Eğer aktif değilse:
   - iyzico müşteri hizmetleri ile iletişime geçin
   - Merchant ID'nizi paylaşın
   - Subscription API aktivasyonu talep edin

## 🛠️ Adım 4: Ürün ve Plan Oluşturma (Production)

Production ortamında ürün ve plan referans kodlarını oluşturmanız gerekebilir:

### 4.1. Ürün Oluşturma

1. iyzico panelinde **"Ürünler"** (Products) bölümüne gidin
2. **"Yeni Ürün"** (New Product) butonuna tıklayın
3. Ürün bilgilerini girin:
   - **Ürün Adı:** "Randevum İşletme Üyeliği"
   - **Açıklama:** "Aylık işletme aboneliği"
4. Ürünü kaydedin ve **"Ürün Referans Kodu"** (Product Reference Code) değerini not edin

### 4.2. Plan Oluşturma

1. Oluşturduğunuz ürünün altında **"Yeni Plan"** (New Plan) butonuna tıklayın
2. Plan bilgilerini girin:
   - **Plan Adı:** "Randevum Aylık Plan"
   - **Fiyat:** 99.99 TL
   - **Ödeme Aralığı:** Aylık (MONTHLY)
   - **Para Birimi:** TRY
3. Planı kaydedin ve **"Plan Referans Kodu"** (Pricing Plan Reference Code) değerini not edin

## 📝 Adım 5: Not Edilmesi Gereken Bilgiler

Production'a geçiş için aşağıdaki bilgileri hazır bulundurun:

- ✅ **API Key** (Production)
- ✅ **Secret Key** (Production)
- ✅ **Ürün Referans Kodu** (Product Reference Code) - Eğer manuel oluşturduysanız
- ✅ **Plan Referans Kodu** (Pricing Plan Reference Code) - Eğer manuel oluşturduysanız
- ✅ **Merchant ID** (Üye İşyeri Numarası)

## 🔄 Adım 6: Backend Kodunda Otomatik Oluşturma

**Not:** Backend kodumuz (`server/src/services/iyzicoService.js`) ürün ve planı otomatik olarak oluşturabilir. Eğer manuel oluşturmak istemiyorsanız:

1. Backend'i production API anahtarları ile başlatın
2. İlk ödeme işlemi sırasında sistem otomatik olarak ürün ve planı oluşturacak
3. Terminal loglarında ürün ve plan referans kodlarını göreceksiniz
4. Bu kodları `.env` dosyasına ekleyin (tekrar oluşturulmasını önlemek için)

## ⚠️ Önemli Notlar

1. **Sandbox vs Production:**
   - Sandbox API anahtarları: `sandbox-xxxxx` ile başlar
   - Production API anahtarları: Farklı formatta olabilir
   - İkisi birbirinden tamamen farklıdır

2. **Test Kartları:**
   - Production'da gerçek kartlarla test yapabilirsiniz
   - iyzico production test kartları da sağlayabilir (destek ekibinden talep edin)

3. **Webhook URL:**
   - Production'da webhook URL'iniz HTTPS olmalı
   - iyzico panelinde webhook URL'ini ayarlamayı unutmayın

## 📞 Destek

Eğer herhangi bir adımda sorun yaşarsanız:
- iyzico Müşteri Hizmetleri: [destek@iyzico.com](mailto:destek@iyzico.com)
- iyzico Panel: [merchant.iyzipay.com](https://merchant.iyzipay.com)

## ✅ Sonraki Adım

API anahtarlarını aldıktan sonra:
1. `server/.env` dosyasını güncelleyin (Adım 2)
2. Production backend'i test edin
3. Webhook URL'ini yapılandırın

