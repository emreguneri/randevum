import { Injectable, Logger } from "@nestjs/common";
import { TripsRepository } from "../../db/repositories/trips.repository";
import { DriverPresenceRepository } from "../../db/repositories/driver-presence.repository";
import { DriversRepository } from "../../db/repositories/drivers.repository";
import { TripsService } from "../trips/trips.service";

const MAX_SEARCH_RADIUS_KM = 8;
const OFFER_TIMEOUT_MS = 45 * 1000; // 45 seconds
const MAX_MATCHING_TIME_MS = 3 * 60 * 1000; // 3 minutes

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly tripsRepo: TripsRepository,
    private readonly presenceRepo: DriverPresenceRepository,
    private readonly driversRepo: DriversRepository,
    private readonly tripsService: TripsService,
  ) {}

  // Simple distance calculation (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async findEligibleDrivers(
    pickupLat: number,
    pickupLng: number,
    maxRadiusKm: number,
  ): Promise<Array<{ driverId: string; distance: number }>> {
    // In production, use PostGIS for efficient spatial queries
    // For MVP, we'll do a simple in-memory filter
    // This is a placeholder - in real implementation, query DB with spatial index

    // Mock: return empty for now, will be implemented with actual DB query
    // TODO: Implement with PostGIS ST_DWithin or similar
    return [];
  }

  async matchStandard(tripId: string): Promise<{ success: boolean; driverId?: string }> {
    const trip = await this.tripsRepo.findById(tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.status !== "AUTHORIZED") {
      throw new Error(`Cannot match trip in status: ${trip.status}`);
    }

    const startTime = Date.now();
    const searchRadii = [3, 5, 8]; // km

    for (const radius of searchRadii) {
      if (Date.now() - startTime > MAX_MATCHING_TIME_MS) {
        this.logger.warn(`Matching timeout for trip ${tripId}`);
        break;
      }

      // Find eligible drivers within radius
      // For MVP, we'll use a simplified approach
      // In production, use PostGIS spatial queries
      const eligibleDrivers = await this.findEligibleDrivers(
        trip.pickupLat!,
        trip.pickupLng!,
        radius,
      );

      // Sort by distance
      eligibleDrivers.sort((a, b) => a.distance - b.distance);

      // Try each driver sequentially
      for (const { driverId } of eligibleDrivers) {
        if (Date.now() - startTime > MAX_MATCHING_TIME_MS) {
          break;
        }

        // Check if driver is still available
        const activeTrip = await this.tripsRepo.findActiveByDriverId(driverId);
        if (activeTrip) {
          continue; // Driver is busy
        }

        // Check driver status
        const driver = await this.driversRepo.findById(driverId);
        if (!driver || driver.status !== "ACTIVE") {
          continue;
        }

        // Check presence
        const presence = await this.presenceRepo.findByDriverId(driverId);
        if (!presence || !presence.isOnline) {
          continue;
        }

        // Check last seen (within 2 minutes)
        const lastSeenAge = Date.now() - presence.lastSeen.getTime();
        if (lastSeenAge > 2 * 60 * 1000) {
          continue;
        }

        // Offer trip to driver (in production, send push notification)
        // For MVP, we'll simulate acceptance after a short delay
        // In real implementation, driver would accept via API call

        // Simulate offer timeout
        await new Promise((resolve) => setTimeout(resolve, OFFER_TIMEOUT_MS));

        // For MVP, auto-accept first eligible driver
        // In production, driver would call POST /trips/:id/accept
        try {
          await this.tripsService.assignDriver(tripId, driverId);
          this.logger.log(`Matched trip ${tripId} to driver ${driverId}`);
          return { success: true, driverId };
        } catch (error) {
          this.logger.warn(`Failed to assign driver ${driverId} to trip ${tripId}: ${error}`);
          continue;
        }
      }
    }

    this.logger.warn(`No driver found for trip ${tripId} within ${MAX_MATCHING_TIME_MS}ms`);
    return { success: false };
  }
}

