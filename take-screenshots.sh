#!/bin/bash

# Screenshot Alma Script'i
# Bu script, iOS Simulator'da screenshot alma sürecini kolaylaştırır

echo "📸 Screenshot Alma Script'i Başlatılıyor..."
echo ""

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Screenshot klasörü oluştur
SCREENSHOT_DIR="$HOME/Desktop/Randevum-Screenshots"
mkdir -p "$SCREENSHOT_DIR"
echo "${GREEN}✅ Screenshot klasörü oluşturuldu: $SCREENSHOT_DIR${NC}"
echo ""

# Cihaz listesi
echo "${YELLOW}📱 Cihaz Seçimi:${NC}"
echo "1. iPhone 14 Pro Max (6.7\" Display) - 1290 x 2796px"
echo "2. iPhone 11 Pro Max (6.5\" Display) - 1284 x 2778px"
echo "3. Her ikisi için de screenshot al"
echo ""
read -p "Seçiminiz (1/2/3): " device_choice

case $device_choice in
    1)
        DEVICE="iPhone 14 Pro Max"
        DEVICE_CODE="6.7"
        ;;
    2)
        DEVICE="iPhone 11 Pro Max"
        DEVICE_CODE="6.5"
        ;;
    3)
        DEVICE="both"
        ;;
    *)
        echo "Geçersiz seçim. Varsayılan olarak iPhone 14 Pro Max seçildi."
        DEVICE="iPhone 14 Pro Max"
        DEVICE_CODE="6.7"
        ;;
esac

echo ""
echo "${GREEN}📋 Screenshot Listesi:${NC}"
echo "1. Ana Ekran (Randevu Al)"
echo "2. İşletme Detay"
echo "3. Randevu Alma"
echo "4. Harita"
echo "5. Profil"
echo ""

# Simulator kontrolü
echo "${YELLOW}🔍 Simulator kontrol ediliyor...${NC}"
if ! xcrun simctl list devices | grep -q "Booted"; then
    echo "${YELLOW}⚠️  Simulator açık değil. Lütfen önce Simulator'ı açın:${NC}"
    echo "   npx expo run:ios"
    echo "   veya"
    echo "   open -a Simulator"
    echo ""
    read -p "Simulator'ı açtınız mı? (y/n): " simulator_ready
    if [ "$simulator_ready" != "y" ]; then
        echo "Simulator açılmadı. Script sonlandırılıyor."
        exit 1
    fi
fi

echo ""
echo "${GREEN}✅ Simulator hazır!${NC}"
echo ""
echo "${YELLOW}📸 Screenshot alma talimatları:${NC}"
echo ""
echo "1. Uygulamayı Simulator'da açın"
echo "2. Her ekran için:"
echo "   - İstediğiniz ekrana gidin"
echo "   - Mac'te: Cmd + S tuşlarına basın"
echo "   - Screenshot otomatik olarak Desktop'a kaydedilir"
echo ""
echo "3. Screenshot'ları bu klasöre taşıyın:"
echo "   $SCREENSHOT_DIR"
echo ""

# Screenshot alma adımları
echo "${GREEN}📋 Adım Adım Screenshot Alma:${NC}"
echo ""
echo "1️⃣  Ana Ekran (Randevu Al sekmesi)"
echo "   → Uygulama açıldığında bu ekranda olmalısınız"
echo "   → Cmd + S"
echo ""
echo "2️⃣  İşletme Detay"
echo "   → Ana ekranda bir işletmeye tıklayın"
echo "   → İşletme detay sayfası açılacak"
echo "   → Cmd + S"
echo ""
echo "3️⃣  Randevu Alma"
echo "   → İşletme detay sayfasında 'Randevu Al' butonuna tıklayın"
echo "   → Randevu alma ekranı açılacak"
echo "   → Cmd + S"
echo ""
echo "4️⃣  Harita"
echo "   → Alt menüden 'Harita' sekmesine tıklayın"
echo "   → Harita ekranı açılacak"
echo "   → Cmd + S"
echo ""
echo "5️⃣  Profil"
echo "   → Alt menüden 'Profilim' sekmesine tıklayın"
echo "   → Profil ekranı açılacak"
echo "   → Cmd + S"
echo ""

read -p "Screenshot'ları aldınız mı? (y/n): " screenshots_done

if [ "$screenshots_done" = "y" ]; then
    echo ""
    echo "${GREEN}✅ Screenshot'lar alındı!${NC}"
    echo ""
    echo "${YELLOW}📁 Screenshot'ları kontrol edin:${NC}"
    echo "   Desktop'ta 'Screen Shot [tarih] at [saat].png' dosyalarını bulun"
    echo ""
    echo "${YELLOW}📝 Sonraki adımlar:${NC}"
    echo "1. Screenshot'ları $SCREENSHOT_DIR klasörüne taşıyın"
    echo "2. Dosya isimlerini düzenleyin (opsiyonel):"
    echo "   - screenshot-1-ana-ekran-$DEVICE_CODE.png"
    echo "   - screenshot-2-isletme-detay-$DEVICE_CODE.png"
    echo "   - screenshot-3-randevu-alma-$DEVICE_CODE.png"
    echo "   - screenshot-4-harita-$DEVICE_CODE.png"
    echo "   - screenshot-5-profil-$DEVICE_CODE.png"
    echo "3. App Store Connect'e yükleyin"
    echo ""
else
    echo ""
    echo "${YELLOW}⚠️  Screenshot'ları almayı unutmayın!${NC}"
    echo "   Yukarıdaki adımları takip ederek screenshot'ları alın."
    echo ""
fi

echo "${GREEN}✅ Script tamamlandı!${NC}"
echo ""
echo "${YELLOW}📚 Detaylı rehber: SCREENSHOTS_ADIM_ADIM.md${NC}"

