const Iyzipay = require('iyzipay');

const DEFAULT_BASE_URL = 'https://sandbox-api.iyzipay.com';

function createIyzipayClient() {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri = process.env.IYZICO_BASE_URL || DEFAULT_BASE_URL;

  if (!apiKey || !secretKey) {
    console.warn('[iyzico] API anahtarları tanımlı değil. Sandbox çağrıları başarısız olur.');
  }

  return new Iyzipay({
    apiKey: apiKey || '',
    secretKey: secretKey || '',
    uri,
  });
}

module.exports = createIyzipayClient();
