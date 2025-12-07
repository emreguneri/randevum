require('dotenv').config();

const express = require('express');
const cors = require('cors');

const iyzicoRoutes = require('./routes/iyzicoRoutes');
const smsRoutes = require('./routes/smsRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/iyzico', iyzicoRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/webhook', webhookRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Endpoint bulunamadı: ${req.path}` });
});

app.use((err, _req, res, _next) => {
  console.error('Beklenmeyen sunucu hatası:', err);
  res.status(500).json({ status: 'error', message: 'Sunucu hatası' });
});

app.listen(PORT, () => {
  console.log(`iyzico entegrasyon sunucusu ${PORT} portunda çalışıyor`);
});
