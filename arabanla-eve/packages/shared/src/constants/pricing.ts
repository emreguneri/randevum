// Monetary values are integer kuruş.
export const BASE_FARE_KURUS = 40000; // 400 TRY
export const COMMISSION_RATE = 0.18;
export const PREAUTH_BUFFER_RATE = 0.15;
export const FREE_WAIT_MINUTES = 10;
export const CANCEL_FEE_KURUS = 10000; // 100 TRY
export const NO_SHOW_FEE_KURUS = 15000; // 150 TRY
export const SCHEDULED_MIN_LEAD_MINUTES = 30;

// Default taxi-based rates (admin can override); stored as integer kuruş.
export const DEFAULT_TAXI_KM_RATE_KURUS = 3630; // 36.30 TRY/km
export const DEFAULT_TAXI_MINUTE_RATE_KURUS = 756; // 7.56 TRY/min

// Derived multipliers (20% uplift)
export const TAXI_RATE_UPLIFT = 1.2;

export const DEFAULT_KM_RATE_KURUS = Math.round(
  DEFAULT_TAXI_KM_RATE_KURUS * TAXI_RATE_UPLIFT,
); // 4356 kuruş (43.56 TRY/km)

export const DEFAULT_WAIT_RATE_PER_MIN_KURUS = Math.round(
  DEFAULT_TAXI_MINUTE_RATE_KURUS * TAXI_RATE_UPLIFT,
); // ~907 kuruş (9.07 TRY/min)

