# iyzico Webhook Entegrasyonu

## Webhook Endpoint

Webhook endpoint'i oluşturuldu: `/api/webhook/iyzico/callback`

Bu endpoint iyzico Subscription API'den gelen abonelik durumu bildirimlerini işler.

## Özellikler

- ✅ Abonelik yenileme bildirimleri (RENEWAL)
- ✅ Abonelik iptal bildirimleri (CANCELLATION)
- ✅ Ödeme başarısız bildirimleri (PAYMENT_FAILED)
- ✅ Firestore'da kullanıcı abonelik durumunu otomatik güncelleme

## Kurulum

### 1. Firebase Admin SDK Kurulumu

Firebase Admin SDK backend'e eklendi. Firestore'a yazma yapabilmek için aşağıdaki yöntemlerden birini kullanabilirsiniz:

#### Yöntem 1: Service Account Key (Önerilen)

1. Firebase Console → Project Settings → Service Accounts
2. "Generate New Private Key" butonuna tıklayın
3. İndirilen JSON dosyasını `server/serviceAccountKey.json` olarak kaydedin
4. `.gitignore`'a ekleyin (güvenlik için)

#### Yöntem 2: Environment Variable

`.env` dosyasına ekleyin:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...",...}'
```

veya

```env
FIREBASE_PROJECT_ID=your-project-id
```

### 2. iyzico Webhook URL'i Ayarlama

iyzico panelinde webhook URL'ini ayarlayın:

1. iyzico Sanal POS Panel → Ayarlar → Bildirim URL'leri
2. Webhook URL: `https://your-backend-url.com/api/webhook/iyzico/callback`

**Not:** Production'da HTTPS kullanmanız gerekir. Development için localtunnel veya ngrok kullanabilirsiniz.

### 3. Environment Variable

`.env` dosyasına backend URL'ini ekleyin:

```env
BACKEND_URL=https://your-backend-url.com
# veya
BACKEND_API_URL=https://your-backend-url.com
```

## Webhook Event Types

Webhook endpoint'i aşağıdaki event'leri işler:

- `RENEWAL` / `SUBSCRIPTION_RENEWED`: Abonelik yenilendi
- `CANCELLATION` / `SUBSCRIPTION_CANCELLED`: Abonelik iptal edildi
- `PAYMENT_FAILED` / `PAYMENT_FAILURE`: Ödeme başarısız
- `ACTIVE`: Abonelik aktif

## Firestore Güncellemeleri

Webhook alındığında Firestore'daki `users` koleksiyonunda aşağıdaki alanlar güncellenir:

- `subscriptionStatus`: 'active' | 'inactive' | 'failed'
- `subscriptionEndsAt`: Abonelik bitiş tarihi (yenileme durumunda)
- `subscriptionCancelledAt`: İptal tarihi
- `lastRenewalAt`: Son yenileme tarihi
- `lastPaymentFailedAt`: Son başarısız ödeme tarihi
- `iyzico.lastWebhookReceivedAt`: Son webhook alınma tarihi

## Test

### Development (ngrok kullanarak)

```bash
# ngrok kurulumu (macOS)
brew install ngrok

# Backend'i ngrok ile expose edin
ngrok http 4000

# Çıkan URL'i kopyalayın (örn: https://abc123.ngrok.io)
# iyzico panelinde webhook URL olarak ayarlayın:
# https://abc123.ngrok.io/api/webhook/iyzico/callback
```

### Manuel Test

```bash
curl -X POST http://localhost:4000/api/webhook/iyzico/callback \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionReferenceCode": "test-subscription-code",
    "status": "ACTIVE",
    "eventType": "RENEWAL",
    "paymentStatus": "SUCCESS"
  }'
```

## Güvenlik

⚠️ **Önemli:** Production'da webhook endpoint'ine erişimi kısıtlamak için:

1. IP whitelist kullanın (iyzico IP adresleri)
2. İmza doğrulaması yapın (iyzico'nun sağladığı güvenlik anahtarı ile)
3. HTTPS kullanın (SSL sertifikası gerekli)

## Sorun Giderme

### Firebase Admin SDK Initialize Edilemedi

- Service account key dosyasının doğru yerde olduğundan emin olun
- `.env` dosyasında `FIREBASE_PROJECT_ID` veya `FIREBASE_SERVICE_ACCOUNT` tanımlı mı kontrol edin
- Terminal loglarında hata mesajlarını kontrol edin

### Webhook Çalışmıyor

- Backend URL'inin doğru olduğundan emin olun
- iyzico panelinde webhook URL'inin ayarlandığından emin olun
- Terminal loglarında `[Webhook]` mesajlarını kontrol edin

### Firestore Güncellenmiyor

- Firebase Admin SDK'nın initialize edildiğini kontrol edin
- Service account'un Firestore'a yazma yetkisi olduğundan emin olun
- `subscriptionReferenceCode`'un Firestore'daki kullanıcıda doğru kaydedildiğini kontrol edin

