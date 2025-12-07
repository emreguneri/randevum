const express = require('express');
const { sendSMS, sendAppointmentSMS } = require('../services/smsService');

const router = express.Router();

function handleError(res, error) {
  console.error('[SMS Route] Hata:', error?.message || error);
  return res.status(400).json({
    status: 'error',
    message: error?.message || 'SMS gönderme işlemi başarısız oldu',
  });
}

/**
 * POST /api/sms/send
 * Tek bir SMS gönderir
 * Body: { phoneNumber: string, message: string }
 */
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'phoneNumber ve message alanları zorunludur',
      });
    }

    const result = await sendSMS(phoneNumber, message);
    return res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * POST /api/sms/appointment
 * Randevu oluşturulduğunda müşteri ve işletme sahibine SMS gönderir
 * Body: {
 *   appointmentData: {
 *     shopName: string,
 *     service: string,
 *     preferredDate: string,
 *     preferredTime: string,
 *     customerName: string,
 *     customerPhone: string
 *   },
 *   businessOwnerPhone: string
 * }
 */
router.post('/appointment', async (req, res) => {
  try {
    const { appointmentData, businessOwnerPhone } = req.body;

    if (!appointmentData) {
      return res.status(400).json({
        status: 'error',
        message: 'appointmentData alanı zorunludur',
      });
    }

    const result = await sendAppointmentSMS(appointmentData, businessOwnerPhone);
    
    return res.json({
      status: 'success',
      data: result,
      message: result.errors.length > 0 
        ? 'SMS gönderimi kısmen başarılı (bazı hatalar oluştu)'
        : 'SMS\'ler başarıyla gönderildi',
    });
  } catch (error) {
    return handleError(res, error);
  }
});

module.exports = router;

