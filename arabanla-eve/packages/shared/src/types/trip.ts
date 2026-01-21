export type TripMode = "STANDARD" | "ROUTE";
export type TimeMode = "NOW" | "SCHEDULED";

export type TripStatus =
  | "REQUESTED"
  | "AUTHORIZED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELED";

export type PaymentStatus =
  | "NONE"
  | "AUTHORIZED"
  | "CAPTURED"
  | "SPLIT_RECORDED"
  | "PAYOUT_PENDING"
  | "PAID_OUT"
  | "AUTH_FAILED"
  | "CAPTURE_FAILED"
  | "REFUNDED"
  | "DISPUTED";

export interface PricingSnapshot {
  pricingVersion: number;
  baseFareKurus: number;
  kmRateKurus: number;
  waitRatePerMinKurus: number;
  commissionRate: number;
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
}

export interface TripPricingBreakdown {
  baseFareKurus: number;
  distanceKurus: number;
  waitingKurus: number;
  totalKurus: number;
  platformFeeKurus: number;
  driverEarningsKurus: number;
}

export interface TripEvent {
  id: string;
  tripId: string;
  status: TripStatus;
  createdAt: string;
  actor: "SYSTEM" | "USER" | "DRIVER" | "ADMIN";
  metadata?: Record<string, any>;
}

