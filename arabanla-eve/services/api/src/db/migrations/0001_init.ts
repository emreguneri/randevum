export const name = "0001_init";

export const up = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  submerchant_key VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_presence (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id),
  is_online BOOLEAN NOT NULL DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  provider VARCHAR(20) NOT NULL,
  token VARCHAR(255) NOT NULL,
  brand VARCHAR(20),
  last4 VARCHAR(4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_configs (
  id SERIAL PRIMARY KEY,
  pricing_version INTEGER NOT NULL,
  taxi_km_rate_kurus INTEGER NOT NULL,
  taxi_minute_rate_kurus INTEGER NOT NULL,
  km_rate_kurus INTEGER NOT NULL,
  wait_rate_per_min_kurus INTEGER NOT NULL,
  commission_rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  status VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'NONE',
  mode VARCHAR(20) NOT NULL,
  time_mode VARCHAR(20) NOT NULL,
  pricing_version INTEGER NOT NULL,
  estimated_distance_km NUMERIC,
  estimated_duration_min NUMERIC,
  actual_distance_km NUMERIC,
  waiting_minutes NUMERIC,
  fare_kurus INTEGER,
  platform_fee_kurus INTEGER,
  driver_earnings_kurus INTEGER,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trip_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  status VARCHAR(20) NOT NULL,
  actor VARCHAR(20) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  provider VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  auth_id VARCHAR(100),
  capture_id VARCHAR(100),
  amount_kurus INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  account VARCHAR(20) NOT NULL,
  amount_kurus INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  amount_kurus INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  scheduled_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  status VARCHAR(20) NOT NULL,
  amount_kurus INTEGER,
  reason TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export const down = `
DROP TABLE IF EXISTS disputes;
DROP TABLE IF EXISTS payouts;
DROP TABLE IF EXISTS ledger_entries;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS trip_events;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS pricing_configs;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS driver_presence;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS users;
`;

