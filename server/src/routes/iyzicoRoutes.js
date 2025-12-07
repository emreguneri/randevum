const express = require('express');
const {
  createSubscriptionProduct,
  createPricingPlan,
  createCustomer,
  createCard,
  initializeSubscription,
} = require('../services/iyzicoService');

const router = express.Router();

function handleError(res, error) {
  console.error('[iyzico] request failed:', error?.message || error);
  return res.status(400).json({
    status: 'error',
    message: error?.message || 'İyzico isteği başarısız oldu',
    code: error?.code,
    raw: error?.raw,
  });
}

router.post('/products', async (req, res) => {
  try {
    const result = await createSubscriptionProduct(req.body);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

router.post('/plans', async (req, res) => {
  try {
    const result = await createPricingPlan(req.body);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

router.post('/customers', async (req, res) => {
  try {
    const result = await createCustomer(req.body);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

router.post('/cards', async (req, res) => {
  try {
    const result = await createCard(req.body);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

router.post('/subscriptions', async (req, res) => {
  try {
    const result = await initializeSubscription(req.body);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

module.exports = router;
