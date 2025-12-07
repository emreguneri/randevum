const admin = require('firebase-admin');

// Firebase Admin SDK'yı initialize et
// Service account key JSON dosyası kullanılabilir veya environment variables
if (!admin.apps.length) {
  try {
    // Önce environment variables'dan service account bilgilerini al
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase Admin] ✅ Service account ile initialize edildi');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Environment variables ile initialize (Firebase CLI'den gelen credentials veya application default credentials)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('[Firebase Admin] ✅ Project ID ile initialize edildi:', process.env.FIREBASE_PROJECT_ID);
    } else {
      // Service account key JSON dosyası (opsiyonel)
      try {
        const serviceAccount = require('../../serviceAccountKey.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('[Firebase Admin] ✅ Service account key dosyası ile initialize edildi');
      } catch (fileError) {
        console.warn('[Firebase Admin] ⚠️ Firebase Admin SDK initialize edilemedi. Service account bilgileri eksik.');
        console.warn('[Firebase Admin] Webhook endpoint çalışacak ancak Firestore güncellemesi yapılmayacak.');
      }
    }
  } catch (error) {
    console.error('[Firebase Admin] Initialize hatası:', error.message);
  }
}

module.exports = admin;

