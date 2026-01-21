import { Client } from "pg";
import {
  DEFAULT_KM_RATE_KURUS,
  DEFAULT_TAXI_KM_RATE_KURUS,
  DEFAULT_TAXI_MINUTE_RATE_KURUS,
  DEFAULT_WAIT_RATE_PER_MIN_KURUS,
  COMMISSION_RATE,
} from "@arabanla-eve/shared";

export async function runSeed(client: Client) {
  const pricingVersion = 1;
  await client.query(
    `
    INSERT INTO pricing_configs (
      pricing_version, taxi_km_rate_kurus, taxi_minute_rate_kurus,
      km_rate_kurus, wait_rate_per_min_kurus, commission_rate
    ) VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT DO NOTHING;
  `,
    [
      pricingVersion,
      DEFAULT_TAXI_KM_RATE_KURUS,
      DEFAULT_TAXI_MINUTE_RATE_KURUS,
      DEFAULT_KM_RATE_KURUS,
      DEFAULT_WAIT_RATE_PER_MIN_KURUS,
      COMMISSION_RATE,
    ],
  );

  // Seed sample user and driver
  const userRes = await client.query(
    "INSERT INTO users(phone) VALUES($1) ON CONFLICT(phone) DO UPDATE SET phone=EXCLUDED.phone RETURNING id",
    ["+900000000000"],
  );
  const userId = userRes.rows[0].id;
  const driverRes = await client.query(
    "INSERT INTO drivers(user_id, status) VALUES($1,'ACTIVE') ON CONFLICT DO NOTHING RETURNING id",
    [userId],
  );
  const driverId = driverRes.rows[0]?.id;
  if (driverId) {
    await client.query(
      "INSERT INTO driver_presence(driver_id,is_online,last_seen) VALUES($1,true,now()) ON CONFLICT(driver_id) DO UPDATE SET is_online=true,last_seen=now()",
      [driverId],
    );
  }
}

