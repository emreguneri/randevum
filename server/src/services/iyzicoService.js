const Iyzipay = require('iyzipay');
const iyzipayClient = require('../config/iyzico');

const DEFAULT_CALLBACK_URL = process.env.IYZICO_CALLBACK_URL || 'https://example.com/iyzico/callback';
const DEFAULT_PRODUCT_NAME = process.env.IYZICO_PRODUCT_NAME || 'Randevum İşletme Üyeliği';
const DEFAULT_PLAN_NAME = process.env.IYZICO_PLAN_NAME || 'Randevum Aylık Plan';
const DEFAULT_PLAN_PRICE = process.env.IYZICO_PLAN_PRICE || '99.99';

let cachedProductReferenceCode = process.env.IYZICO_PRODUCT_CODE || null;
let cachedPlanReferenceCode = process.env.IYZICO_PLAN_CODE || null;

function generateConversationId() {
  return `conv-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function toPriceString(price) {
  if (typeof price === 'string') {
    return price;
  }
  return Number(price || 0).toFixed(2);
}

function callIyzipay(method, context, request) {
  return new Promise((resolve, reject) => {
    method.call(context, request, (err, result) => {
      if (err) {
        return reject(err);
      }

      const status = typeof result?.status === 'string' ? result.status.toLowerCase() : '';
      if (status === 'success' || (!status && result?.data)) {
        return resolve(result);
      }

      const error = new Error(result?.errorMessage || 'iyzico request failed');
      error.code = result?.errorCode;
      error.raw = result;
      return reject(error);
    });
  });
}

async function createSubscriptionProduct({ name, description }) {
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: generateConversationId(),
    name,
    description: description || `${name} aboneliği`,
  };

  try {
    return await callIyzipay(
      iyzipayClient.subscriptionProduct.create,
      iyzipayClient.subscriptionProduct,
      request
    );
  } catch (error) {
    // Eğer ürün zaten varsa (201001), ürün listesinden bulmaya çalış
    if (error?.code === '201001' || error?.raw?.errorCode === '201001') {
      console.warn('[iyzico] Ürün zaten mevcut, mevcut ürünü kullanıyoruz.');
      // Ürün listesini çek (iyzico API'sinde list endpoint'i varsa)
      // Şimdilik null döndür, ensureSubscriptionPlan'da handle edilecek
      throw new Error('PRODUCT_EXISTS');
    }
    throw error;
  }
}

async function createPricingPlan({
  productReferenceCode,
  name,
  price,
  currency = Iyzipay.CURRENCY.TRY,
  paymentInterval = 'MONTHLY',
  paymentIntervalCount = 1,
  trialDays = 0,
}) {
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: generateConversationId(),
    productReferenceCode,
    name,
    price: typeof price === 'string' ? parseFloat(price) : price, // iyzico expects number, not string
    currencyCode: currency || Iyzipay.CURRENCY.TRY, // Field name is currencyCode, not currency!
    paymentInterval: paymentInterval === 'MONTHLY' ? Iyzipay.SUBSCRIPTION_PRICING_PLAN_INTERVAL.MONTHLY : paymentInterval,
    paymentIntervalCount,
    trialPeriodDays: trialDays, // Field name is trialPeriodDays, not trialDays!
    planPaymentType: Iyzipay.PLAN_PAYMENT_TYPE.RECURRING, // Required field
  };

  // Debug: Log request to see what we're sending
  console.log('[iyzico] Creating pricing plan with request:', JSON.stringify(request, null, 2));

  return callIyzipay(
    iyzipayClient.subscriptionPricingPlan.create,
    iyzipayClient.subscriptionPricingPlan,
    request
  );
}

async function createCustomer({
  email,
  gsmNumber,
  name,
  surname,
  identityNumber,
  billingAddress,
  shippingAddress,
}) {
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: generateConversationId(),
    email,
    gsmNumber,
    name,
    surname,
    identityNumber,
    billingAddress,
    shippingAddress,
  };

  return callIyzipay(
    iyzipayClient.subscriptionCustomer.create,
    iyzipayClient.subscriptionCustomer,
    request
  );
}

async function createCard({
  customerReferenceCode,
  cardAlias,
  cardHolderName,
  cardNumber,
  expireMonth,
  expireYear,
  cvc,
  registerCard = '0',
}) {
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: generateConversationId(),
    customerReferenceCode,
    card: {
      cardAlias,
      cardHolderName,
      cardNumber,
      expireMonth,
      expireYear,
      cvc,
      registerCard,
    },
  };

  return callIyzipay(
    iyzipayClient.subscriptionCard.create,
    iyzipayClient.subscriptionCard,
    request
  );
}

async function initializeSubscription({
  pricingPlanReferenceCode,
  customerReferenceCode,
  customer,
  paymentCard,
  callbackUrl = DEFAULT_CALLBACK_URL,
  subscriptionInitialStatus = Iyzipay.SUBSCRIPTION_INITIAL_STATUS.ACTIVE,
}) {
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: generateConversationId(),
    pricingPlanReferenceCode,
    customerReferenceCode,
    callbackUrl,
    subscriptionInitialStatus,
    paymentCard,
  };

  // Include customer object if provided (required for subscription.initialize)
  if (customer) {
    request.customer = customer;
  }

  return callIyzipay(
    iyzipayClient.subscription.initialize,
    iyzipayClient.subscription,
    request
  );
}

async function ensureSubscriptionPlan() {
  if (cachedProductReferenceCode && cachedPlanReferenceCode) {
    return {
      productReferenceCode: cachedProductReferenceCode,
      pricingPlanReferenceCode: cachedPlanReferenceCode,
    };
  }

  // Önce .env'den kontrol et
  if (process.env.IYZICO_PRODUCT_CODE && process.env.IYZICO_PLAN_CODE) {
    cachedProductReferenceCode = process.env.IYZICO_PRODUCT_CODE;
    cachedPlanReferenceCode = process.env.IYZICO_PLAN_CODE;
    return {
      productReferenceCode: cachedProductReferenceCode,
      pricingPlanReferenceCode: cachedPlanReferenceCode,
    };
  }

  let productReferenceCode = process.env.IYZICO_PRODUCT_CODE || null;

  // Ürün yoksa oluştur
  if (!productReferenceCode) {
    try {
      const productResponse = await createSubscriptionProduct({
        name: DEFAULT_PRODUCT_NAME,
        description: `${DEFAULT_PRODUCT_NAME} aboneliği`,
      });

      productReferenceCode =
        productResponse?.data?.referenceCode ||
        productResponse?.referenceCode ||
        productResponse?.data?.data?.referenceCode;

      if (productReferenceCode) {
        cachedProductReferenceCode = productReferenceCode;
        console.warn(
          `[iyzico] Ürün referans kodu: ${productReferenceCode}. Tekrarlayan kullanımlar için .env dosyanıza IYZICO_PRODUCT_CODE=${productReferenceCode} ekleyin.`
        );
      }
    } catch (error) {
      // Ürün zaten varsa, manuel olarak .env'e eklenmesi gerekiyor
      if (error?.message === 'PRODUCT_EXISTS') {
        throw new Error(
          'Ürün zaten mevcut. Lütfen .env dosyanıza IYZICO_PRODUCT_CODE=<ürün_referans_kodu> ekleyin. Ürün referans kodunu iyzico panelinden alabilirsiniz.'
        );
      }
      throw error;
    }
  }

  if (!productReferenceCode) {
    throw new Error('Iyzico ürün referans kodu alınamadı.');
  }

  cachedProductReferenceCode = productReferenceCode;

  const planResponse = await createPricingPlan({
    productReferenceCode,
    name: DEFAULT_PLAN_NAME,
    price: DEFAULT_PLAN_PRICE,
    currency: Iyzipay.CURRENCY.TRY, // Explicitly set currency
    paymentInterval: 'MONTHLY',
    paymentIntervalCount: 1,
    trialDays: 0,
  });

  const pricingPlanReferenceCode =
    planResponse?.data?.referenceCode ||
    planResponse?.referenceCode ||
    planResponse?.data?.data?.referenceCode;

  if (!pricingPlanReferenceCode) {
    throw new Error('Iyzico plan referans kodu alınamadı.');
  }

  cachedPlanReferenceCode = pricingPlanReferenceCode;
  if (!process.env.IYZICO_PLAN_CODE) {
    console.warn(
      `[iyzico] Plan referans kodu: ${pricingPlanReferenceCode}. Tekrarlayan kullanımlar için .env dosyanıza IYZICO_PLAN_CODE=${pricingPlanReferenceCode} ekleyin.`
    );
  }

  return {
    productReferenceCode,
    pricingPlanReferenceCode,
  };
}

function normalizePhoneNumber(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('90') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.length === 10) {
    return `+90${cleaned}`;
  }
  if (!cleaned.startsWith('+') && cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+9${cleaned}`;
  }
  if (cleaned.startsWith('+90')) {
    return `+${cleaned.replace(/^\+/, '')}`;
  }
  return `+${cleaned}`;
}

module.exports = {
  createSubscriptionProduct,
  createPricingPlan,
  createCustomer,
  createCard,
  initializeSubscription,
  ensureSubscriptionPlan,
  normalizePhoneNumber,
};
