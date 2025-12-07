# Firebase Admin SDK Kurulum Rehberi

## Neden Gerekli?

Webhook endpoint'i iyzico'dan gelen abonelik bildirimlerini Firestore'da güncellemek için Firebase Admin SDK'ya ihtiyaç duyuyor.

## Adım Adım Kurulum

### 1. Firebase Console'a Giriş Yapın

1. Tarayıcıda [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Projenizi seçin (randevum-66b5e veya proje adınız)

### 2. Service Account Key İndirin

1. Sol menüden **⚙️ Project Settings** (Proje Ayarları) tıklayın
2. Üstteki sekmelerden **Service Accounts** sekmesine tıklayın
3. Sayfanın altında **"Generate new private key"** (Yeni özel anahtar oluştur) butonuna tıklayın
4. Açılan uyarıda **"Generate key"** butonuna tıklayın
5. JSON dosyası otomatik olarak indirilecek

### 3. Dosyayı Doğru Yere Kaydedin

1. İndirilen JSON dosyasını bulun (genellikle Downloads klasöründe)
2. Dosyayı `server/serviceAccountKey.json` olarak kaydedin
   - Dosya adı tam olarak `serviceAccountKey.json` olmalı
   - `server` klasörünün içine kaydedin

**Örnek yol:** `/Users/emreguneri/Berber/server/serviceAccountKey.json`

### 4. .gitignore'a Ekleme (Güvenlik)

`.gitignore` dosyasına `serviceAccountKey.json` ekleyin (zaten ekli olabilir, kontrol edin):

```
server/serviceAccountKey.json
```

Bu dosya hassas bilgiler içerdiği için GitHub'a yüklenmemeli!

## Alternatif Yöntem (Environment Variable)

Eğer dosya kullanmak istemiyorsanız, `.env` dosyasına ekleyebilirsiniz:

1. İndirdiğiniz JSON dosyasının içeriğini kopyalayın
2. `.env` dosyasına ekleyin:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...",...}'
```

**Not:** JSON içeriğini tek satırda yazın, tırnak işaretlerini escape edin.

## Test

Server'ı yeniden başlattığınızda terminal'de şu mesajı görmelisiniz:

```
[Firebase Admin] ✅ Service account key dosyası ile initialize edildi
```

Eğer hata görürseniz:
- Dosyanın doğru yerde olduğundan emin olun
- Dosya adının `serviceAccountKey.json` olduğundan emin olun
- JSON formatının geçerli olduğundan emin olun

## Sorun Giderme

### "Cannot find module '../../serviceAccountKey.json'"

- Dosyanın `server/serviceAccountKey.json` yolunda olduğundan emin olun
- Dosya adının tam olarak `serviceAccountKey.json` olduğundan emin olun (büyük/küçük harf duyarlı)

### "Firebase Admin SDK initialize edilemedi"

- JSON dosyasının geçerli olduğundan emin olun
- Firebase Console'dan yeni bir key indirip tekrar deneyin

### "Permission denied" hatası

- Service account'un Firestore'a yazma yetkisi olduğundan emin olun
- Firebase Console → IAM & Admin → Service Accounts bölümünden kontrol edin

