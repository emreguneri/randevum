import { TripStatus } from "@arabanla-eve/shared";
import { DomainError } from "../errors/domain-error";

const allowed: Record<TripStatus, TripStatus[]> = {
  REQUESTED: ["AUTHORIZED", "CANCELED"],
  AUTHORIZED: ["DRIVER_ASSIGNED", "CANCELED"],
  DRIVER_ASSIGNED: ["DRIVER_ARRIVED", "CANCELED"],
  DRIVER_ARRIVED: ["STARTED", "CANCELED"],
  STARTED: ["COMPLETED", "CANCELED"],
  COMPLETED: ["CANCELED"],
  CANCELED: [],
};

export function assertTripTransition(
  from: TripStatus,
  to: TripStatus,
): void {
  const next = allowed[from] || [];
  if (!next.includes(to)) {
    throw new DomainError(`Illegal trip transition: ${from} -> ${to}`);
  }
}

