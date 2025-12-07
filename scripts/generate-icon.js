const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcon() {
  const size = 1024;
  const outputPath = path.join(__dirname, '../assets/images/icon.png');
  
  // SVG oluştur (koyu arka plan + beyaz Rv metni)
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2d0a0a;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1a0a0a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0a0505;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)" rx="${size * 0.22}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="${size * 0.4}" 
        font-weight="bold" 
        fill="#ffffff" 
        text-anchor="middle" 
        dominant-baseline="middle"
        letter-spacing="-2"
      >Rv</text>
    </svg>
  `;

  try {
    // SVG'yi PNG'ye dönüştür
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Icon başarıyla oluşturuldu: ${outputPath}`);
    console.log(`📐 Boyut: ${size}x${size} piksel`);
  } catch (error) {
    console.error('❌ Icon oluşturulurken hata:', error);
    process.exit(1);
  }
}

generateIcon();
