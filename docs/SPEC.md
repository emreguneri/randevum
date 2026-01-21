# Arabanla Eve MVP Specification

This document captures the MVP scope for Istanbul-wide designated driver service **Arabanla Eve**. It is intentionally concise to pair with `docs/API.md`.

## Architecture
- Monorepo with apps (customer, driver, admin), backend API, shared package, and infra docker-compose (Postgres + Redis).
- Backend uses Node.js (NestJS style), Postgres for persistence, Redis + BullMQ for jobs, Socket.io for realtime.
- Payments go through a provider interface with `MockPaymentProvider` first, and `IyzicoPaymentProvider` behind the same contract.

## Core Concepts
- **Trip modes**: request mode `STANDARD` or `ROUTE`; time mode `NOW` or `SCHEDULED`.
- **Pricing**: base fare, km, waiting, configurable taxi-based rates. All amounts are stored as integer kuruş.
- **State machines**: strict transitions for TripStatus and PaymentStatus; illegal transitions are rejected and logged.
- **Matching**: proximity-based for STANDARD; route-aware for ROUTE; scheduled attempts at T-30/T-15 with fallbacks.
- **Payments**: pre-auth before matching; capture on completion; guardrails cap capture to auth amount; ledger + payouts with 48h hold; disputes hold payouts.

## Acceptance Criteria (tracked for MVP)
1. NOW + STANDARD happy path with preauth, driver lifecycle, capture, receipt.
2. ROUTE with fallback to STANDARD after 6–8 minutes.
3. SCHEDULED with attempts at T-30/T-15, notification at T-10, fallback at T-5.
4. Cancel fee after DRIVER_ASSIGNED (100 TRY).
5. No-show fee after DRIVER_ARRIVED (150 TRY + waiting beyond free 10).
6. Pricing versioning on admin changes.
7. Weekly payout job after 48h hold transitions to PAID_OUT.
8. Dispute hold + admin resolution with refund.

## Data Model (high level)
- `users`, `drivers`, `driver_presence`, `payment_methods`
- `trips`, `trip_events`, `payments`
- `ledger_entries`, `payouts`, `disputes`
- `pricing_configs` (includes `pricing_version`, taxi rates)

## Modules (backend)
- auth, users, drivers, presence, trips, matching, pricing, payments, payouts, disputes, notifications, admin.

## Providers
- `payments`: mock + iyzico (authorize, capture, void, refund, payout).
- `sms`, `maps`, push (FCM/APNs minimal), Socket.io for realtime events.

## Mobile Apps
- React Native Expo for customer + driver.
- Core flows: request/schedule trip, track status, accept/arrive/start/complete/no-show, pricing + receipt.
- Services layer: API client, location, notifications; shared types from `packages/shared`.

## Admin (Next.js)
- Trips list/detail with event timeline and payment status.
- Drivers list with status/approve/suspend.
- Pricing config edit (taxi rates, pricing_version increment).
- Disputes list/resolve (refund/reject).
- Payouts page for weekly batches and retries.

## Dev Environment
- `infra/docker-compose.yml` brings up Postgres + Redis.
- Migrations + seeds supply sample users/drivers and default pricing config.
- Jobs: matching scheduler, payout runner (BullMQ).

## Testing Approach
- Start with MockPaymentProvider to satisfy acceptance flows.
- Add iyzico adapter behind same interface and flag via config.
- Simulate scheduled events via controllable job scheduling during development.

