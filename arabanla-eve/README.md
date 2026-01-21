# Arabanla Eve - Istanbul Designated Driver App MVP

End-to-end working MVP: Customer mobile app + Driver mobile app + Admin web panel + Backend API.

## Project Structure

```
arabanla-eve/
├── apps/
│   ├── customer/          # React Native Expo (customer app)
│   ├── driver/            # React Native Expo (driver app)
│   └── admin/             # Next.js (admin panel)
├── services/
│   └── api/               # Backend API (NestJS)
├── packages/
│   └── shared/            # Shared types, constants, validators
├── infra/
│   └── docker-compose.yml # Postgres + Redis
└── docs/
    ├── SPEC.md            # Product specification
    └── API.md             # API documentation
```

## Tech Stack

- **Mobile Apps**: React Native Expo
- **Admin**: Next.js
- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ (planned)
- **Payments**: MockPaymentProvider (MVP), IyzicoPaymentProvider (production)

## Quick Start

### 1. Start Infrastructure

```bash
cd infra
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

### 2. Setup Backend

```bash
cd services/api
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Start Customer App

```bash
cd apps/customer
npm install
npm start
```

Scan QR code with Expo Go app or press `i` for iOS simulator / `a` for Android emulator.

### 4. Start Driver App

```bash
cd apps/driver
npm install
npm start
```

### 5. Start Admin Panel

```bash
cd apps/admin
npm install
npm run dev
```

Admin panel will run on `http://localhost:3001`

## Testing

See [TESTING.md](./TESTING.md) for detailed testing guide, including Acceptance Criteria #1 (NOW + STANDARD flow).

## Key Features

### Customer App
- OTP-based authentication
- Trip request (STANDARD/ROUTE, NOW/SCHEDULED)
- Real-time trip status tracking
- Payment preauth/capture
- Receipt display

### Driver App
- OTP-based authentication
- Online/offline status toggle
- Trip acceptance
- Trip lifecycle management (arrive, start, complete)
- No-show reporting

### Backend API
- JWT authentication
- Trip state machine (strict transitions)
- Payment provider abstraction (Mock + Iyzico)
- Pricing calculation (base + km + waiting)
- Matching service (STANDARD with sequential offers)
- Ledger entries (USER/PLATFORM/DRIVER)

## Database

All monetary amounts stored as **integer kuruş** (1 TRY = 100 kuruş).

### Key Tables
- `users` - Customer and driver users
- `drivers` - Driver profiles
- `driver_presence` - Real-time driver location/status
- `trips` - Trip records with pricing snapshot
- `trip_events` - State transition history
- `payments` - Payment authorizations and captures
- `ledger_entries` - Accounting entries
- `pricing_configs` - Versioned pricing configuration

## Payment Flow

1. **Preauth**: Before matching, authorize `estimated_fare * 1.15`
2. **Capture**: On completion, capture final fare (capped to auth amount)
3. **Split**: Platform fee (18%), driver earnings (82%)
4. **Ledger**: Record entries for USER (debit), PLATFORM (credit), DRIVER (credit)

## Pricing

- **Base Fare**: 400 TRY (40,000 kuruş)
- **KM Rate**: Taxi rate * 1.20 (default: 43.56 TRY/km)
- **Wait Rate**: Taxi minute rate * 1.20 (default: 9.07 TRY/min)
- **Free Wait**: First 10 minutes
- **Commission**: 18%

## Environment Variables

### Backend (`services/api/.env`)
```env
DATABASE_URL=postgres://arabanla:arabanla@localhost:5432/arabanla_eve
REDIS_URL=redis://localhost:6379
PAYMENT_PROVIDER=mock
PORT=3000
JWT_SECRET=arabanla-eve-secret-key-change-in-production
```

## Development

### Type Checking
```bash
npm run typecheck --workspaces --if-present
```

### Database Migrations
```bash
cd services/api
npm run migrate
```

### Database Seeds
```bash
cd services/api
npm run seed
```

## Next Steps

- [ ] Implement ROUTE matching with fallback
- [ ] Implement SCHEDULED matching with jobs
- [ ] Add WebSocket for real-time updates
- [ ] Implement IyzicoPaymentProvider
- [ ] Add push notifications (FCM/APNs)
- [ ] Complete admin panel screens
- [ ] Add dispute management
- [ ] Implement payout jobs

## License

Private - Arabanla Eve

