const express = require('express');
const {
  ensureSubscriptionPlan,
  createCustomer,
  createCard,
  initializeSubscription,
  normalizePhoneNumber,
} = require('../services/iyzicoService');
const {
  verifyReceipt,
  extractSubscriptionInfo,
  isSubscriptionActive,
} = require('../services/appleReceiptService');

const router = express.Router();

function handleError(res, error) {
  console.error('[Payments] subscribe error:', error?.message || error);
  return res.status(400).json({
    status: 'error',
    message: error?.message || 'Abonelik işlemi başarısız oldu',
    code: error?.code,
    raw: error?.raw,
  });
}

function validateSubscribePayload(body) {
  const requiredCustomerFields = ['name', 'surname', 'email', 'phone'];
  const requiredCardFields = ['cardHolderName', 'cardNumber', 'expireMonth', 'expireYear', 'cvc'];

  if (!body?.customer) {
    throw new Error('customer bilgisi zorunludur');
  }

  if (!body?.card) {
    throw new Error('card bilgisi zorunludur');
  }

  for (const field of requiredCustomerFields) {
    if (!body.customer[field] || !String(body.customer[field]).trim()) {
      throw new Error(`customer.${field} alanı zorunludur`);
    }
  }

  for (const field of requiredCardFields) {
    if (!body.card[field] || !String(body.card[field]).trim()) {
      throw new Error(`card.${field} alanı zorunludur`);
    }
  }
}

router.post('/subscribe', async (req, res) => {
  try {
    validateSubscribePayload(req.body);

    const { customer, card, address } = req.body;
    const normalizedPhone = normalizePhoneNumber(customer.phone);

    const { productReferenceCode, pricingPlanReferenceCode } = await ensureSubscriptionPlan();

    const customerPayload = {
      email: customer.email,
      gsmNumber: normalizedPhone,
      name: customer.name,
      surname: customer.surname,
      identityNumber: customer.identityNumber || '11111111111',
      billingAddress: {
        contactName: `${customer.name} ${customer.surname}`.trim(),
        city: address?.city || 'İstanbul',
        country: address?.country || 'Turkey',
        address: address?.line || 'Randevum Sanal Adres',
        zipCode: address?.zipCode || '34000',
      },
      shippingAddress: {
        contactName: `${customer.name} ${customer.surname}`.trim(),
        city: address?.city || 'İstanbul',
        country: address?.country || 'Turkey',
        address: address?.line || 'Randevum Sanal Adres',
        zipCode: address?.zipCode || '34000',
      },
    };

    const customerResponse = await createCustomer(customerPayload);
    const customerReferenceCode =
      customerResponse?.data?.referenceCode ||
      customerResponse?.referenceCode ||
      customerResponse?.data?.data?.referenceCode;

    if (!customerReferenceCode) {
      throw new Error('Müşteri referans kodu alınamadı.');
    }

    // Webhook callback URL'i - iyzico'dan gelen bildirimler için
    const backendUrl = process.env.BACKEND_URL || process.env.BACKEND_API_URL || 'http://localhost:4000';
    const callbackUrl = `${backendUrl}/api/webhook/iyzico/callback`;
    
    // Directly use card details in subscription.initialize (as per iyzico docs)
    // Include customer object even though customer is already created
    const subscriptionResponse = await initializeSubscription({
      pricingPlanReferenceCode,
      customerReferenceCode,
      customer: {
        name: customer.name,
        surname: customer.surname,
        identityNumber: customer.identityNumber || '11111111111',
        email: customer.email,
        gsmNumber: normalizedPhone,
        billingAddress: customerPayload.billingAddress,
        shippingAddress: customerPayload.shippingAddress,
      },
      paymentCard: {
        cardHolderName: card.cardHolderName,
        cardNumber: card.cardNumber.replace(/\s+/g, ''),
        expireMonth: card.expireMonth,
        expireYear: card.expireYear,
        cvc: card.cvc,
        registerConsumerCard: true, // Register card for future payments
      },
      callbackUrl, // Webhook callback URL'i eklendi
    });

    const subscriptionReferenceCode =
      subscriptionResponse?.data?.referenceCode ||
      subscriptionResponse?.referenceCode ||
      subscriptionResponse?.data?.data?.referenceCode;

    const cardToken =
      subscriptionResponse?.data?.cardToken || subscriptionResponse?.cardToken || subscriptionResponse?.data?.data?.cardToken;
    const cardUserKey =
      subscriptionResponse?.data?.cardUserKey || subscriptionResponse?.cardUserKey || subscriptionResponse?.data?.data?.cardUserKey;

    return res.json({
      status: 'success',
      data: {
        productReferenceCode,
        pricingPlanReferenceCode,
        customerReferenceCode,
        cardToken: cardToken || null,
        cardUserKey: cardUserKey || null,
        subscriptionReferenceCode,
        subscriptionStatus: subscriptionResponse?.status || subscriptionResponse?.data?.status || 'success',
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * Apple App Store receipt validation endpoint
 * iOS IAP için receipt doğrulama
 */
router.post('/apple/validate-receipt', async (req, res) => {
  try {
    const { receiptData, userId, durationMonths } = req.body;

    if (!receiptData) {
      return res.status(400).json({
        status: 'error',
        message: 'receiptData zorunludur',
      });
    }

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'userId zorunludur',
      });
    }

    // Receipt'i doğrula (önce production, gerekirse sandbox)
    const validationResult = await verifyReceipt(receiptData, null, true);

    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Receipt doğrulaması başarısız',
      });
    }

    // En son receipt info'yu al (aktif abonelik)
    const latestReceiptInfo = validationResult.latest_receipt_info;
    if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Receipt\'te abonelik bilgisi bulunamadı',
      });
    }

    // En son transaction'ı al
    const latestTransaction = latestReceiptInfo[latestReceiptInfo.length - 1];
    const subscriptionInfo = extractSubscriptionInfo(latestTransaction);
    const isActive = isSubscriptionActive(latestTransaction);

    if (!isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Abonelik süresi dolmuş',
        subscriptionInfo,
      });
    }

    // Abonelik bitiş tarihini hesapla
    let subscriptionEndDate;
    if (subscriptionInfo.expiresDate) {
      subscriptionEndDate = subscriptionInfo.expiresDate.toISOString();
    } else {
      // Eğer expiresDate yoksa, durationMonths'a göre hesapla
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (durationMonths || subscriptionInfo.durationMonths || 1));
      subscriptionEndDate = endDate.toISOString();
    }

    return res.json({
      status: 'success',
      data: {
        subscriptionInfo,
        subscriptionEndDate,
        productId: subscriptionInfo.productId,
        transactionId: subscriptionInfo.transactionId,
        originalTransactionId: subscriptionInfo.originalTransactionId,
        isActive,
        environment: validationResult.environment,
      },
    });
  } catch (error) {
    console.error('[Payments] Apple receipt validation error:', error?.message || error);
    return res.status(400).json({
      status: 'error',
      message: error?.message || 'Receipt doğrulaması başarısız oldu',
    });
  }
});

module.exports = router;

