# Simulator Test Rehberi

## Adım 1: Docker Kurulumu (Gerekli)

Docker Desktop'ı kurun:
- Mac: https://www.docker.com/products/docker-desktop/
- Kurulumdan sonra Docker Desktop'ı başlatın

## Adım 2: Infrastructure Başlatma

```bash
cd infra
docker compose up -d
```

Postgres ve Redis başlatılacak.

## Adım 3: Backend Setup

```bash
cd services/api
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

Backend `http://localhost:3000` adresinde çalışacak.

**Önemli:** Backend console'da OTP kodlarını göreceksiniz (mock implementation).

## Adım 4: Customer App (iOS Simulator)

Yeni bir terminal açın:

```bash
cd apps/customer
npm install
npm start
```

Terminal'de:
- `i` tuşuna basın → iOS Simulator açılır
- Veya QR kodu göreceksiniz

## Adım 5: Driver App (İkinci Simulator)

Yeni bir terminal açın:

```bash
# Yeni bir simulator window açın
open -a Simulator

# Driver app'i başlatın
cd apps/driver
npm install
npm start
```

Terminal'de:
- `i` tuşuna basın → İkinci simulator'a yüklenir

## Test Senaryosu

### Customer App (Simulator 1):

1. **Login:**
   - Telefon: `5551234567`
   - "Kod Gönder" → Backend console'da OTP görünecek (örn: `123456`)
   - OTP'yi gir → "Giriş Yap"

2. **Trip Request:**
   - Mode: **STANDARD**
   - Time: **NOW**
   - "Trip İste" butonuna bas
   - Trip oluşturulacak ve preauth yapılacak

### Driver App (Simulator 2):

1. **Login:**
   - Telefon: `5559876543` (farklı numara)
   - OTP ile giriş yap

2. **Go Online:**
   - "Çevrimiçi Durumu" toggle'ını aç

3. **Trip Management:**
   - Aktif trip görünecek (eğer matching çalışıyorsa)
   - "Geldim" → "Yolculuğu Başlat" → "Tamamla"

## Sorun Giderme

**Docker çalışmıyor:**
- Docker Desktop açık mı?
- `docker ps` komutu çalışıyor mu?

**Backend başlamıyor:**
- Postgres çalışıyor mu? `docker ps` ile kontrol edin
- `.env` dosyası var mı?
- `npm run migrate` başarılı oldu mu?

**Simulator açılmıyor:**
- Xcode kurulu mu?
- `xcode-select --install` çalıştırın

**App backend'e bağlanamıyor:**
- Backend çalışıyor mu? `curl http://localhost:3000/health`
- Simulator için `localhost:3000` çalışmalı

## Hızlı Komutlar

```bash
# Tüm servisleri başlat
cd infra && docker compose up -d
cd ../services/api && npm run migrate && npm run seed && npm run dev

# Customer app (yeni terminal)
cd apps/customer && npm start  # 'i' bas

# Driver app (yeni terminal)
open -a Simulator  # Yeni simulator
cd apps/driver && npm start  # 'i' bas
```

