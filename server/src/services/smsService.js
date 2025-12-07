const axios = require('axios');

// NetGSM SMS API Configuration
const NETGSM_API_URL = process.env.NETGSM_API_URL || 'https://api.netgsm.com.tr/sms/send/get';
const NETGSM_USERNAME = process.env.NETGSM_USERNAME || '';
const NETGSM_PASSWORD = process.env.NETGSM_PASSWORD || '';
const NETGSM_MSGHEADER = process.env.NETGSM_MSGHEADER || 'RANDEVUM'; // SMS başlığı

/**
 * Telefon numarasını NetGSM formatına çevirir
 * Örnek: 05321234567 -> 5321234567
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Boşluk, tire, parantez gibi karakterleri temizle
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Başındaki 0'ı kaldır
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // +90 ile başlıyorsa kaldır
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.substring(2);
  }
  
  // 10 haneli olmalı (5321234567)
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return cleaned;
  }
  
  return null;
}

/**
 * NetGSM üzerinden SMS gönderir
 * @param {string} phoneNumber - Alıcı telefon numarası (05321234567 formatında)
 * @param {string} message - Gönderilecek mesaj
 * @returns {Promise<Object>} - API yanıtı
 */
async function sendSMS(phoneNumber, message) {
  if (!NETGSM_USERNAME || !NETGSM_PASSWORD) {
    throw new Error('NetGSM kullanıcı adı ve şifre tanımlı değil');
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    throw new Error(`Geçersiz telefon numarası: ${phoneNumber}`);
  }

  if (!message || message.trim().length === 0) {
    throw new Error('Mesaj boş olamaz');
  }

  try {
    // NetGSM GET API
    const params = new URLSearchParams({
      usercode: NETGSM_USERNAME,
      password: NETGSM_PASSWORD,
      gsmno: formattedPhone,
      message: message,
      msgheader: NETGSM_MSGHEADER,
      dil: 'TR', // Türkçe karakter desteği
    });

    const response = await axios.get(`${NETGSM_API_URL}?${params.toString()}`, {
      timeout: 10000,
    });

    // NetGSM yanıtı genellikle string olarak gelir
    const result = response.data;
    
    // Başarılı yanıt kontrolü
    if (typeof result === 'string') {
      // "00" ile başlıyorsa başarılı
      if (result.startsWith('00')) {
        return {
          success: true,
          messageId: result.trim(),
          message: 'SMS başarıyla gönderildi',
        };
      }
      // Hata kodları
      else if (result.startsWith('20')) {
        throw new Error('NetGSM: Mesaj metni hatalı');
      } else if (result.startsWith('30')) {
        throw new Error('NetGSM: Kullanıcı adı veya şifre hatalı');
      } else if (result.startsWith('40')) {
        throw new Error('NetGSM: Abone hesabınızda yeterli kredi yok');
      } else if (result.startsWith('50')) {
        throw new Error('NetGSM: Abone hesabınızda SMS gönderme yetkisi yok');
      } else if (result.startsWith('51')) {
        throw new Error('NetGSM: Telefon numarası formatı hatalı');
      } else if (result.startsWith('70')) {
        throw new Error('NetGSM: Hatalı sorgu');
      } else {
        throw new Error(`NetGSM hatası: ${result}`);
      }
    }

    return {
      success: true,
      data: result,
      message: 'SMS başarıyla gönderildi',
    };
  } catch (error) {
    console.error('[SMS] NetGSM API hatası:', error.message);
    
    if (error.response) {
      // HTTP hata yanıtı
      throw new Error(`NetGSM API hatası: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      // İstek gönderilemedi
      throw new Error('NetGSM API\'ye bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } else {
      // Diğer hatalar
      throw new Error(`SMS gönderme hatası: ${error.message}`);
    }
  }
}

/**
 * Randevu bilgileri ile SMS mesajı oluşturur
 * @param {Object} appointmentData - Randevu bilgileri
 * @param {string} recipientType - 'customer' veya 'business'
 * @returns {string} - SMS mesajı
 */
function createAppointmentSMS(appointmentData, recipientType = 'customer') {
  const { shopName, service, preferredDate, preferredTime, customerName, customerPhone } = appointmentData;
  
  if (recipientType === 'customer') {
    // Müşteriye gönderilecek SMS
    return `Merhaba ${customerName || 'Değerli Müşterimiz'},\n\nRandevunuz başarıyla oluşturuldu:\n\n📅 Tarih: ${preferredDate}\n🕐 Saat: ${preferredTime}\n💇 Hizmet: ${service}\n🏪 Dükkan: ${shopName}\n\nRandevunuzu değiştirmek veya iptal etmek için uygulamayı kullanabilirsiniz.\n\nİyi günler dileriz.\nRandevum`;
  } else {
    // İşletme sahibine gönderilecek SMS
    return `Yeni Randevu Bildirimi\n\n📅 Tarih: ${preferredDate}\n🕐 Saat: ${preferredTime}\n👤 Müşteri: ${customerName || 'Misafir'}\n📞 Telefon: ${customerPhone || 'Belirtilmemiş'}\n💇 Hizmet: ${service}\n\nLütfen randevuyu onaylayın veya iptal edin.\n\nRandevum`;
  }
}

/**
 * Randevu oluşturulduğunda müşteri ve işletme sahibine SMS gönderir
 * @param {Object} appointmentData - Randevu bilgileri
 * @param {string} businessOwnerPhone - İşletme sahibi telefon numarası
 * @returns {Promise<Object>} - Gönderim sonuçları
 */
async function sendAppointmentSMS(appointmentData, businessOwnerPhone) {
  const results = {
    customer: null,
    business: null,
    errors: [],
  };

  // Müşteriye SMS gönder
  if (appointmentData.customerPhone) {
    try {
      const customerMessage = createAppointmentSMS(appointmentData, 'customer');
      const customerResult = await sendSMS(appointmentData.customerPhone, customerMessage);
      results.customer = customerResult;
      console.log('[SMS] ✅ Müşteriye SMS gönderildi:', appointmentData.customerPhone);
    } catch (error) {
      console.error('[SMS] ❌ Müşteriye SMS gönderilemedi:', error.message);
      results.errors.push({ type: 'customer', error: error.message });
    }
  }

  // İşletme sahibine SMS gönder
  if (businessOwnerPhone) {
    try {
      const businessMessage = createAppointmentSMS(appointmentData, 'business');
      const businessResult = await sendSMS(businessOwnerPhone, businessMessage);
      results.business = businessResult;
      console.log('[SMS] ✅ İşletme sahibine SMS gönderildi:', businessOwnerPhone);
    } catch (error) {
      console.error('[SMS] ❌ İşletme sahibine SMS gönderilemedi:', error.message);
      results.errors.push({ type: 'business', error: error.message });
    }
  }

  return results;
}

module.exports = {
  sendSMS,
  sendAppointmentSMS,
  createAppointmentSMS,
  formatPhoneNumber,
};

