/**
 * Firestore'a Test İşletmeleri Ekleme Script'i
 * Screenshot'lar için çeşitli kategorilerden işletmeler ekler
 */

const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK'yı başlat
const serviceAccount = require(path.join(__dirname, '../server/serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Test işletmeleri - Çeşitli kategorilerden
const testShops = [
  // Pilates Salonu
  {
    name: 'Zen Pilates Studio',
    slug: 'zen-pilates-studio',
    category: 'Pilates',
    address: 'Karesi, Balıkesir',
    phone: '+90 266 123 4567',
    description: 'Profesyonel pilates eğitmenleri ile sağlıklı yaşam',
    rating: 4.8,
    totalRatings: 45,
    workingHours: { start: '09:00', end: '20:00' },
    workingDays: [1, 2, 3, 4, 5, 6], // Pazartesi-Cumartesi
    services: [
      { name: 'Grup Pilates Dersi', duration: 60, price: 150 },
      { name: 'Özel Pilates Dersi', duration: 60, price: 300 },
      { name: 'Mat Pilates', duration: 45, price: 100 },
    ],
    location: {
      latitude: 39.6484,
      longitude: 27.8826,
    },
    photos: [],
    isPaymentActive: true,
    ownerId: 'test-owner-1',
    shareUrl: 'https://randevum.tr/book/zen-pilates-studio',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // Güzellik Salonu
  {
    name: 'Elite Beauty Salon',
    slug: 'elite-beauty-salon',
    category: 'Güzellik Salonu',
    address: 'Merkez, Balıkesir',
    phone: '+90 266 234 5678',
    description: 'Cilt bakımı, makyaj ve güzellik hizmetleri',
    rating: 4.9,
    totalRatings: 128,
    workingHours: { start: '10:00', end: '19:00' },
    workingDays: [1, 2, 3, 4, 5, 6],
    services: [
      { name: 'Cilt Bakımı', duration: 90, price: 400 },
      { name: 'Makyaj', duration: 60, price: 250 },
      { name: 'Kaş Tasarımı', duration: 30, price: 150 },
      { name: 'Kirpik Lifting', duration: 45, price: 200 },
    ],
    location: {
      latitude: 39.6514,
      longitude: 27.8846,
    },
    photos: [],
    isPaymentActive: true,
    ownerId: 'test-owner-2',
    shareUrl: 'https://randevum.tr/book/elite-beauty-salon',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // Kuaför
  {
    name: 'Modern Kuaför',
    slug: 'modern-kuaför',
    category: 'Kuaför',
    address: 'Altıeylül, Balıkesir',
    phone: '+90 266 345 6789',
    description: 'Modern saç kesimi ve şekillendirme',
    rating: 4.7,
    totalRatings: 89,
    workingHours: { start: '09:00', end: '18:00' },
    workingDays: [1, 2, 3, 4, 5, 6],
    services: [
      { name: 'Saç Kesimi (Kadın)', duration: 45, price: 200 },
      { name: 'Saç Kesimi (Erkek)', duration: 30, price: 100 },
      { name: 'Fön', duration: 30, price: 150 },
      { name: 'Saç Boyama', duration: 120, price: 500 },
    ],
    location: {
      latitude: 39.6534,
      longitude: 27.8866,
    },
    photos: [],
    isPaymentActive: true,
    ownerId: 'test-owner-3',
    shareUrl: 'https://randevum.tr/book/modern-kuaför',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // Nailart
  {
    name: 'Nail Art Studio',
    slug: 'nail-art-studio',
    category: 'Nailart',
    address: 'Karesi, Balıkesir',
    phone: '+90 266 456 7890',
    description: 'Profesyonel oje ve nail art hizmetleri',
    rating: 4.9,
    totalRatings: 67,
    workingHours: { start: '10:00', end: '20:00' },
    workingDays: [1, 2, 3, 4, 5, 6, 0], // Haftanın her günü
    services: [
      { name: 'Klasik Manikür', duration: 45, price: 150 },
      { name: 'Gel Oje', duration: 60, price: 250 },
      { name: 'Nail Art', duration: 90, price: 350 },
      { name: 'Pediür', duration: 60, price: 200 },
    ],
    location: {
      latitude: 39.6494,
      longitude: 27.8836,
    },
    photos: [],
    isPaymentActive: true,
    ownerId: 'test-owner-4',
    shareUrl: 'https://randevum.tr/book/nail-art-studio',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // Psikolog
  {
    name: 'Yaşam Psikoloji Merkezi',
    slug: 'yasam-psikoloji-merkezi',
    category: 'Psikolog',
    address: 'Merkez, Balıkesir',
    phone: '+90 266 567 8901',
    description: 'Bireysel ve çift terapisi hizmetleri',
    rating: 5.0,
    totalRatings: 34,
    workingHours: { start: '09:00', end: '18:00' },
    workingDays: [1, 2, 3, 4, 5],
    services: [
      { name: 'Bireysel Terapi', duration: 50, price: 500 },
      { name: 'Çift Terapisi', duration: 60, price: 600 },
      { name: 'Aile Terapisi', duration: 60, price: 700 },
    ],
    location: {
      latitude: 39.6524,
      longitude: 27.8856,
    },
    photos: [],
    isPaymentActive: true,
    ownerId: 'test-owner-5',
    shareUrl: 'https://randevum.tr/book/yasam-psikoloji-merkezi',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // Masaj
  {
    name: 'Relax Masaj Merkezi',
    slug: 'relax-masaj-merkezi',
    category: 'Masaj',
    address: 'Altıeylül, Balıkesir',
    phone: '+90 266 678 9012',
    description: 'Rahatlama ve terapi masajları',
    rating: 4.6,
    totalRatings: 52,
    workingHours: { start: '10:00', end: '22:00' },
    workingDays: [1, 2, 3, 4, 5, 6, 0],
    services: [
      { name: 'Rahatlama Masajı', duration: 60, price: 300 },
      { name: 'Spor Masajı', duration: 45, price: 250 },
      { name: 'Aromaterapi Masajı', duration: 90, price: 400 },
    ],
    location: {
      latitude: 39.6544,
      longitude: 27.8876,
    },
    photos: [],
    isPaymentActive: true,
    ownerId: 'test-owner-6',
    shareUrl: 'https://randevum.tr/book/relax-masaj-merkezi',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },

  // Berber (mevcut olanların yanına)
  {
    name: 'Klasik Berber',
    slug: 'klasik-berber',
    category: 'Berber',
    address: 'Karesi, Balıkesir',
    phone: '+90 266 789 0123',
    description: 'Geleneksel berber hizmetleri',
    rating: 4.5,
    totalRatings: 76,
    workingHours: { start: '08:00', end: '19:00' },
    workingDays: [1, 2, 3, 4, 5, 6],
    services: [
      { name: 'Saç Kesimi', duration: 30, price: 80 },
      { name: 'Sakal Tıraşı', duration: 20, price: 50 },
      { name: 'Saç + Sakal', duration: 45, price: 120 },
    ],
    location: {
      latitude: 39.6504,
      longitude: 27.8846,
    },
    photos: [],
    isPaymentActive: true,
    ownerId: 'test-owner-7',
    shareUrl: 'https://randevum.tr/book/klasik-berber',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function addTestShops() {
  try {
    console.log('🚀 Test işletmeleri ekleniyor...\n');

    for (const shop of testShops) {
      // Slug kontrolü - eğer varsa güncelle, yoksa ekle
      const existingShop = await db.collection('shops').where('slug', '==', shop.slug).get();
      
      if (!existingShop.empty) {
        // Mevcut işletmeyi güncelle
        const docId = existingShop.docs[0].id;
        await db.collection('shops').doc(docId).update({
          ...shop,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Güncellendi: ${shop.name} (${shop.category})`);
      } else {
        // Yeni işletme ekle
        await db.collection('shops').add(shop);
        console.log(`✅ Eklendi: ${shop.name} (${shop.category})`);
      }
    }

    console.log('\n✨ Tüm test işletmeleri başarıyla eklendi!');
    console.log(`📊 Toplam ${testShops.length} işletme eklendi/güncellendi.`);
    console.log('\n📱 Şimdi uygulamayı yenileyin ve screenshot\'ları alın!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
addTestShops();

