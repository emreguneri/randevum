# Testing Guide - Arabanla Eve MVP

## Acceptance Criteria #1: NOW + STANDARD Flow

Bu test, tam bir trip lifecycle'ını test eder: Customer creates trip -> preauth succeeds -> driver assigned -> arrived -> start -> complete -> capture -> receipt shown.

### Prerequisites

1. **Start Infrastructure:**
   ```bash
   cd infra
   docker-compose up -d
   ```

2. **Setup Backend:**
   ```bash
   cd services/api
   cp .env.example .env
   npm run migrate
   npm run seed
   npm run dev
   ```

3. **Start Customer App:**
   ```bash
   cd apps/customer
   npm start
   ```

4. **Start Driver App (separate terminal):**
   ```bash
   cd apps/driver
   npm start
   ```

### Test Steps

#### Step 1: Customer Login
1. Open customer app
2. Enter phone number (e.g., `5551234567`)
3. Click "Kod Gönder"
4. Check console/logs for OTP code (mock implementation prints to console)
5. Enter OTP code
6. Click "Giriş Yap"

#### Step 2: Driver Login & Go Online
1. Open driver app (separate device/emulator)
2. Login with different phone number (e.g., `5559876543`)
3. Toggle "Çevrimiçi Durumu" to ON
4. Driver should be marked as online

#### Step 3: Customer Creates Trip
1. In customer app, select:
   - Mode: STANDARD
   - Time Mode: NOW
2. Click "Trip İste"
3. Trip should be created with status REQUESTED
4. Payment preauth should happen automatically
5. Trip status should transition to AUTHORIZED

#### Step 4: Driver Assignment (Manual for MVP)
Since matching service is simplified in MVP, you may need to manually assign driver:

**Option A: Use API directly:**
```bash
# Get trip ID from customer app or logs
curl -X POST http://localhost:3000/trips/{tripId}/assign \
  -H "Authorization: Bearer {driver_token}" \
  -H "Content-Type: application/json" \
  -d '{"driverId": "{driver_id}"}'
```

**Option B: Update matching service to auto-assign first available driver**

#### Step 5: Driver Actions
1. In driver app, you should see active trip
2. Click "Geldim" (arrived) - status becomes DRIVER_ARRIVED
3. Click "Yolculuğu Başlat" (start) - status becomes STARTED
4. Click "Tamamla" (complete) - status becomes COMPLETED
5. Payment should be captured automatically

#### Step 6: Verify Receipt
1. In customer app, trip status should show COMPLETED
2. Fare amount should be displayed
3. Receipt breakdown should be visible

### Expected Results

- ✅ Trip created with REQUESTED status
- ✅ Payment preauth succeeds (status: AUTHORIZED)
- ✅ Driver assigned (status: DRIVER_ASSIGNED)
- ✅ Driver arrived (status: DRIVER_ARRIVED)
- ✅ Trip started (status: STARTED)
- ✅ Trip completed (status: COMPLETED)
- ✅ Payment captured (status: CAPTURED)
- ✅ Ledger entries created (USER, PLATFORM, DRIVER)
- ✅ Receipt shown with correct fare breakdown

### Troubleshooting

**Issue: OTP not received**
- Check backend logs for OTP code (mock implementation prints to console)
- Verify phone number format

**Issue: Payment preauth fails**
- Check MockPaymentProvider logs
- Verify payment method ID is valid

**Issue: Driver not assigned**
- Check driver is online (presence.isOnline = true)
- Check driver status is ACTIVE
- Verify matching service is running

**Issue: Trip status not updating**
- Check backend logs for errors
- Verify WebSocket/real-time updates (if implemented)
- Manually refresh trip status

### API Endpoints for Manual Testing

```bash
# Health check
curl http://localhost:3000/health

# Request OTP
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "5551234567"}'

# Verify OTP (get token)
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "5551234567", "code": "123456"}'

# Create trip (use token from above)
curl -X POST http://localhost:3000/trips \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "STANDARD",
    "timeMode": "NOW",
    "pickupLat": 41.0369,
    "pickupLng": 28.9850,
    "dropoffLat": 40.9818,
    "dropoffLng": 29.0218,
    "estimatedDistanceKm": 12.5,
    "estimatedDurationMin": 25,
    "paymentMethodId": "mock-payment-method-1"
  }'

# Get trip status
curl http://localhost:3000/trips/{tripId} \
  -H "Authorization: Bearer {token}"
```

