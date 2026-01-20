const https = require('https');

/**
 * Apple Receipt Validation Service
 * Apple'ın App Store'dan gelen receipt'leri doğrular
 */

// Apple'ın receipt validation URL'leri
const APPLE_RECEIPT_URLS = {
  production: 'https://buy.itunes.apple.com/verifyReceipt',
  sandbox: 'https://sandbox.itunes.apple.com/verifyReceipt',
};

/**
 * Apple receipt'i doğrula
 * @param {string} receiptData - Base64 encoded receipt data
 * @param {string} password - App-specific shared secret (App Store Connect'ten alınacak)
 * @param {boolean} isProduction - Production mu sandbox mu
 * @returns {Promise<Object>} Validation sonucu
 */
async function verifyReceipt(receiptData, password = null, isProduction = true) {
  const url = isProduction ? APPLE_RECEIPT_URLS.production : APPLE_RECEIPT_URLS.sandbox;

  const requestBody = {
    'receipt-data': receiptData,
    'password': password || process.env.APPLE_SHARED_SECRET,
    'exclude-old-transactions': false,
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestBody);
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          // Eğer production'da 21007 hatası alırsak (sandbox receipt), sandbox'a tekrar gönder
          if (response.status === 21007 && isProduction) {
            console.log('[Apple Receipt] Production receipt sandbox receipt, retrying with sandbox...');
            return verifyReceipt(receiptData, password, false)
              .then(resolve)
              .catch(reject);
          }

          if (response.status === 0) {
            resolve({
              success: true,
              receipt: response.receipt,
              latest_receipt_info: response.latest_receipt_info,
              pending_renewal_info: response.pending_renewal_info,
              environment: response.environment,
            });
          } else {
            reject(new Error(`Apple receipt validation failed with status: ${response.status}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse Apple response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Apple receipt validation request failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Receipt'ten abonelik bilgilerini çıkar
 * @param {Object} receiptInfo - Apple'dan gelen receipt info
 * @returns {Object} Abonelik bilgileri
 */
function extractSubscriptionInfo(receiptInfo) {
  const productId = receiptInfo.product_id;
  const purchaseDate = receiptInfo.purchase_date_ms ? new Date(parseInt(receiptInfo.purchase_date_ms)) : null;
  const expiresDate = receiptInfo.expires_date_ms ? new Date(parseInt(receiptInfo.expires_date_ms)) : null;
  const isTrialPeriod = receiptInfo.is_trial_period === 'true';
  const isInIntroOfferPeriod = receiptInfo.is_in_intro_offer_period === 'true';

  // Süre hesaplama (product ID'den)
  let durationMonths = 1;
  if (productId.includes('3months')) {
    durationMonths = 3;
  } else if (productId.includes('6months')) {
    durationMonths = 6;
  } else if (productId.includes('12months')) {
    durationMonths = 12;
  }

  return {
    productId,
    purchaseDate,
    expiresDate,
    durationMonths,
    isTrialPeriod,
    isInIntroOfferPeriod,
    originalTransactionId: receiptInfo.original_transaction_id,
    transactionId: receiptInfo.transaction_id,
  };
}

/**
 * Aktif aboneliği kontrol et
 * @param {Object} receiptInfo - Apple'dan gelen receipt info
 * @returns {boolean} Abonelik aktif mi
 */
function isSubscriptionActive(receiptInfo) {
  if (!receiptInfo.expires_date_ms) {
    return false; // Süresiz abonelik yoksa, expires_date olmalı
  }

  const expiresDate = new Date(parseInt(receiptInfo.expires_date_ms));
  const now = new Date();
  
  return expiresDate > now;
}

module.exports = {
  verifyReceipt,
  extractSubscriptionInfo,
  isSubscriptionActive,
};

