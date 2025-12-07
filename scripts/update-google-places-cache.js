/**
 * Google Places Cache Güncelleme Scripti
 * 
 * Kullanım:
 * node scripts/update-google-places-cache.js --category=Berber --district=Karesi --city=Balıkesir
 * 
 * Bu script:
 * 1. Google Places API'den belirtilen kategori + bölge için mekanları çeker
 * 2. Firestore'da googlePlacesCache collection'ına kaydeder
 * 3. Cache key formatı: {category}-{district}-{city} (lowercase)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Node.js için fetch (Node 18+ için built-in, eski versiyonlar için node-fetch gerekir)
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  try {
    fetch = require('node-fetch');
  } catch (e) {
    console.error('❌ fetch bulunamadı. Node.js 18+ kullanın veya "npm install node-fetch" çalıştırın.');
    process.exit(1);
  }
} else {
  fetch = globalThis.fetch;
}

// Firebase config - .env dosyasından veya direkt olarak
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyCEtk1HSycs-zPTNAQxrkLqBBw45tERfCQ';

// Kategori mapping
const CATEGORY_MAPPING = {
  'Berber': { query: 'berber', type: 'hair_care' },
  'Kuaför': { query: 'kuaför', type: 'beauty_salon' },
  'Güzellik Salonu': { query: 'güzellik salonu', type: 'beauty_salon' },
  'Pilates': { query: 'pilates', type: 'gym' },
  'Spor Salonu': { query: 'spor salonu', type: 'gym' },
  'Masaj': { query: 'masaj', type: 'spa' },
  'Estetik': { query: 'estetik', type: 'beauty_salon' },
  'Cilt Bakımı': { query: 'cilt bakımı', type: 'beauty_salon' }
};

// Şehir koordinatları
const CITY_COORDINATES = {
  'Balıkesir': { latitude: 39.6484, longitude: 27.8826 },
  // Diğer şehirler buraya eklenebilir
};

// İlçe koordinatları için geocoding (gerekirse)
async function getDistrictCoordinates(city, district) {
  try {
    const address = `${district}, ${city}, Türkiye`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { latitude: location.lat, longitude: location.lng };
    }
  } catch (error) {
    console.error('Error fetching district coordinates:', error);
  }
  return null;
}

// Google Places API'den mekanları çek
async function fetchPlacesFromGoogle(category, district, city) {
  const categoryInfo = CATEGORY_MAPPING[category];
  if (!categoryInfo) {
    throw new Error(`Kategori bulunamadı: ${category}`);
  }

  // Şehir koordinatlarını al
  let locationCoords = CITY_COORDINATES[city];
  if (!locationCoords) {
    // Şehir koordinatları yoksa geocoding yap
    const cityCoords = await getDistrictCoordinates(city, city);
    if (cityCoords) {
      locationCoords = cityCoords;
    } else {
      throw new Error(`Şehir koordinatları bulunamadı: ${city}`);
    }
  }

  // İlçe koordinatlarını al (varsa)
  if (district && district !== city) {
    const districtCoords = await getDistrictCoordinates(city, district);
    if (districtCoords) {
      locationCoords = districtCoords;
    }
  }

  const locationParam = `${locationCoords.latitude},${locationCoords.longitude}`;
  const query = encodeURIComponent(`${categoryInfo.query} ${district} ${city}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&location=${locationParam}&radius=15000&type=${categoryInfo.type}&key=${GOOGLE_MAPS_API_KEY}`;

  console.log(`🔍 Google Places API çağrısı: ${category} - ${district} - ${city}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google Places API hatası: ${data.status} - ${data.error_message || ''}`);
  }

  const shops = [];
  if (data.results && Array.isArray(data.results)) {
    data.results.forEach((place) => {
      if (place.geometry?.location) {
        shops.push({
          name: place.name,
          address: place.formatted_address || place.vicinity || 'Adres bilgisi yok',
          coordinates: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          workingHours: place.opening_hours?.weekday_text?.join(', ') || 'Bilinmiyor',
          rating: place.rating || null,
          totalRatings: place.user_ratings_total || 0,
          placeId: place.place_id,
          photos: place.photos?.map(
            (photo) =>
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
          ) || [],
          isPaymentActive: false,
        });
      }
    });
  }

  return shops;
}

// Cache'i Firestore'a kaydet
async function saveToCache(category, district, city, shops) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const cacheKey = `${category.toLowerCase()}-${district.toLowerCase()}-${city.toLowerCase()}`;
  const cacheDocRef = doc(db, 'googlePlacesCache', cacheKey);

  await setDoc(cacheDocRef, {
    category,
    district,
    city,
    shops,
    lastUpdated: serverTimestamp(),
    placeIds: shops.map(shop => shop.placeId).filter(Boolean),
  }, { merge: false });

  console.log(`✅ Cache kaydedildi: ${cacheKey} (${shops.length} mekan)`);
}

// Ana fonksiyon
async function main() {
  const args = process.argv.slice(2);
  
  let category = null;
  let district = null;
  let city = 'Balıkesir'; // Varsayılan

  // Parametreleri parse et
  args.forEach(arg => {
    if (arg.startsWith('--category=')) {
      category = arg.split('=')[1];
    } else if (arg.startsWith('--district=')) {
      district = arg.split('=')[1];
    } else if (arg.startsWith('--city=')) {
      city = arg.split('=')[1];
    }
  });

  if (!category) {
    console.error('❌ Hata: Kategori belirtilmedi');
    console.log('Kullanım: node scripts/update-google-places-cache.js --category=Berber --district=Karesi --city=Balıkesir');
    process.exit(1);
  }

  if (!CATEGORY_MAPPING[category]) {
    console.error(`❌ Hata: Geçersiz kategori: ${category}`);
    console.log(`Kullanılabilir kategoriler: ${Object.keys(CATEGORY_MAPPING).join(', ')}`);
    process.exit(1);
  }

  if (!district) {
    console.error('❌ Hata: İlçe belirtilmedi');
    process.exit(1);
  }

  try {
    console.log(`🚀 Cache güncelleme başlatılıyor...`);
    console.log(`📋 Parametreler: ${category} - ${district} - ${city}`);

    // Google Places API'den mekanları çek
    const shops = await fetchPlacesFromGoogle(category, district, city);
    
    if (shops.length === 0) {
      console.warn('⚠️  Hiç mekan bulunamadı');
      return;
    }

    // Firestore'a kaydet
    await saveToCache(category, district, city, shops);

    console.log(`✅ Başarıyla tamamlandı! ${shops.length} mekan cache'e kaydedildi.`);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
main();

