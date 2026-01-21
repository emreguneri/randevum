# API Service (NestJS-style)

Node.js service providing REST + WebSocket APIs, payments, matching, payouts, and admin functions.

Structure:
- `src/config` — environment and provider wiring.
- `src/modules` — feature modules (auth, users, drivers, presence, trips, matching, pricing, payments, payouts, disputes, notifications, admin).
- `src/db/migrations` — database schema migrations.
- `src/db/seeds` — seed data (sample users/drivers, default pricing).
- `src/jobs` — BullMQ queues and schedulers (matching, payouts).
- `src/providers` — external integrations (payments mock/iyzico, sms, maps, push).
- `src/shared` — shared errors, middleware, utils.

TODO: scaffold NestJS app, entities, repositories, services, controllers, and state machines with strict transitions.

