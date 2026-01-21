# Docker Desktop Kurulum Rehberi (Mac)

## Adım 1: Docker Desktop İndirme

1. **Web tarayıcınızda şu adrese gidin:**
   ```
   https://www.docker.com/products/docker-desktop/
   ```

2. **"Download for Mac" butonuna tıklayın**
   - Apple Silicon (M1/M2/M3) için: "Mac with Apple Silicon"
   - Intel Mac için: "Mac with Intel chip"

## Adım 2: Docker Desktop Kurulumu

1. **İndirilen `.dmg` dosyasını açın**
   - Finder'da Downloads klasöründe bulacaksınız

2. **Docker ikonunu Applications klasörüne sürükleyin**
   - Ekranda gösterilen talimatları takip edin

3. **Applications klasöründen Docker'ı açın**
   - İlk açılışta sistem izni isteyebilir, "Aç" deyin

## Adım 3: Docker Desktop'ı Başlatma

1. **Docker Desktop uygulamasını açın**
   - Applications > Docker

2. **İlk kurulum:**
   - "Use recommended settings" seçin
   - "Finish" butonuna tıklayın
   - Docker başlatılacak (menü çubuğunda balina ikonu görünecek)

3. **Docker'ın hazır olduğunu kontrol edin:**
   - Menü çubuğundaki balina ikonu yeşil olmalı
   - "Docker Desktop is running" yazmalı

## Adım 4: Kurulumu Doğrulama

Terminal'de şu komutu çalıştırın:

```bash
docker --version
```

Çıktı şöyle olmalı:
```
Docker version 24.x.x, build xxxxx
```

## Sorun Giderme

**Problem: "Docker is not running"**
- Docker Desktop uygulamasını açın
- Menü çubuğunda balina ikonuna tıklayın
- "Start" butonuna basın

**Problem: İzin hatası**
- System Preferences > Security & Privacy
- Docker'a izin verin

**Problem: Kurulum çok yavaş**
- İnternet bağlantınızı kontrol edin
- Docker Desktop ilk açılışta güncellemeleri indirebilir

## Kurulum Sonrası

Docker kurulduktan sonra, projeyi başlatmak için:

```bash
cd infra
docker compose up -d
```

Bu komut PostgreSQL ve Redis'i başlatacak.

