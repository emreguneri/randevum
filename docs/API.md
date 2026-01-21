# Arabanla Eve API (MVP)

All amounts are integer kuruş. Authentication uses OTP (MVP mock) and bearer tokens (stub).

## Auth
- `POST /auth/request-otp` — body: `{ phone }` → sends code (mock SMS).
- `POST /auth/verify-otp` — body: `{ phone, code }` → returns `{ token, user }`.

## Customer
- `POST /payment-methods` — add card token (mock/iyzico). Body: `{ token, brand, last4 }`.
- `GET /payment-methods` — list.
- `POST /trips` — create trip. Body includes pickup/dropoff, mode (`STANDARD|ROUTE`), time mode (`NOW|SCHEDULED`), `scheduled_at`, `fallback_to_standard` flag.
- `POST /trips/:id/authorize` — trigger pre-auth via selected payment method.
- `POST /trips/:id/cancel` — cancel request (rules based on status).
- `POST /trips/:id/dispute` — body: `{ reason, amount? }` opens dispute.
- `GET /trips/:id` — trip detail with status timeline and pricing snapshot.

## Driver
- `POST /drivers/onboarding` — submit docs (MVP: create driver + status=PENDING).
- `POST /drivers/presence` — body: `{ is_online, lat, lng }` updates presence/heartbeat.
- `POST /drivers/route` — body: `{ to_area, from_area?, window_start, window_end }` publish route for ROUTE mode.
- Trip actions: `POST /trips/:id/accept`, `/arrived`, `/start`, `/complete`, `/no-show`.

## Admin
- `GET /admin/trips` — filter by status, pricing_version, date.
- `GET /admin/drivers` — list with status; approve/suspend via `POST /admin/drivers/:id/status`.
- `POST /admin/pricing-config` — update taxi rates; increments pricing_version and derived km/min rates.
- `GET /admin/disputes` — list; `POST /admin/disputes/:id/resolve` — `{ resolution: refund|reject, amount? }`.
- `POST /admin/payouts/run` — triggers weekly payout job manually (MVP).

## System/Internal
- Jobs: matching (scheduled + on-demand), payout runner (weekly), notification hooks.
- WebSockets (socket.io namespace `/trips`): events `trip_updated`, `driver_location`, `match_failed`, `scheduled_reminder`.

## Payment Provider Contract
Interface methods (kuruş):
- `authorize(amount, metadata)` → `{ auth_id, status }`
- `capture(auth_id, amount)` → `{ capture_id, status }`
- `void(auth_id)`
- `refund(capture_id, amount)`
- `payout(submerchant_id, amount)`

Implementations:
- `MockPaymentProvider` — deterministic, always succeeds unless flagged.
- `IyzicoPaymentProvider` — wired later; same interface; selectable via config.

## Status Machines (strict)
- TripStatus: `REQUESTED -> AUTHORIZED -> DRIVER_ASSIGNED -> DRIVER_ARRIVED -> STARTED -> COMPLETED`; any → `CANCELED`.
- PaymentStatus: `NONE -> AUTHORIZED -> CAPTURED -> SPLIT_RECORDED -> PAYOUT_PENDING -> PAID_OUT`; errors: `AUTH_FAILED`, `CAPTURE_FAILED`, `REFUNDED`, `DISPUTED`.
- Transitions logged to `trip_events` with actor/context.

## Pricing
Constants (TRY): `BASE_FARE_TRY=400`, `COMMISSION_RATE=0.18`, `PREAUTH_BUFFER_RATE=0.15`, `FREE_WAIT_MINUTES=10`, `CANCEL_FEE_TRY=100`, `NO_SHOW_FEE_TRY=150`.
Derived from taxi rates (admin editable): `KM_RATE_TRY`, `WAIT_RATE_PER_MIN_TRY`.
Fare: `final = BASE_FARE + km*KM_RATE + waiting_fee`; `waiting_fee = max(0, wait_minutes-10)*WAIT_RATE_PER_MIN`.
Preauth: `estimated * (1 + PREAUTH_BUFFER_RATE)`.
Guardrail: capture capped to auth amount; log `manual_adjustment`.

## Events & Notifications
- Push/WS: trip status updates, scheduled reminders, match failures, payout notices.
- Emails optional (not in MVP).

