import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { TripsRepository } from "../../db/repositories/trips.repository";
import { TripEventsRepository } from "../../db/repositories/trip-events.repository";
import { PricingService } from "../pricing/pricing.service";
import { assertTripTransition } from "../../shared/state/trip-state-machine";
import type { TripStatus, TripMode, TimeMode } from "@arabanla-eve/shared";

@Injectable()
export class TripsService {
  constructor(
    private readonly tripsRepo: TripsRepository,
    private readonly tripEventsRepo: TripEventsRepository,
    private readonly pricingService: PricingService,
  ) {}

  async createTrip(
    userId: string,
    data: {
      mode: TripMode;
      timeMode: TimeMode;
      pickupLat: number;
      pickupLng: number;
      dropoffLat: number;
      dropoffLng: number;
      estimatedDistanceKm?: number;
      estimatedDurationMin?: number;
      scheduledAt?: Date;
    },
  ) {
    const config = await this.pricingService.getLatestConfig();

    const trip = await this.tripsRepo.create({
      userId,
      mode: data.mode,
      timeMode: data.timeMode,
      pricingVersion: config.pricingVersion,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      dropoffLat: data.dropoffLat,
      dropoffLng: data.dropoffLng,
      estimatedDistanceKm: data.estimatedDistanceKm,
      estimatedDurationMin: data.estimatedDurationMin,
      scheduledAt: data.scheduledAt,
    });

    await this.tripEventsRepo.create({
      tripId: trip.id,
      status: "REQUESTED",
      actor: "USER",
    });

    return trip;
  }

  async getTrip(tripId: string, userId?: string) {
    const trip = await this.tripsRepo.findById(tripId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    if (userId && trip.userId !== userId) {
      throw new NotFoundException("Trip not found");
    }
    return trip;
  }

  async getUserTrips(userId: string) {
    return this.tripsRepo.findByUserId(userId);
  }

  async getDriverTrips(driverId: string) {
    return this.tripsRepo.findByDriverId(driverId);
  }

  async transitionStatus(
    tripId: string,
    newStatus: TripStatus,
    actor: "SYSTEM" | "USER" | "DRIVER" | "ADMIN",
    metadata?: Record<string, any>,
  ) {
    const trip = await this.tripsRepo.findById(tripId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    assertTripTransition(trip.status, newStatus);

    await this.tripsRepo.updateStatus(tripId, newStatus);
    await this.tripEventsRepo.create({
      tripId,
      status: newStatus,
      actor,
      metadata,
    });

    return this.tripsRepo.findById(tripId);
  }

  async assignDriver(tripId: string, driverId: string) {
    const trip = await this.tripsRepo.findById(tripId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== "AUTHORIZED") {
      throw new BadRequestException(`Cannot assign driver in status: ${trip.status}`);
    }

    await this.tripsRepo.assignDriver(tripId, driverId);
    await this.transitionStatus(tripId, "DRIVER_ASSIGNED", "SYSTEM", { driverId });
  }

  async cancelTrip(tripId: string, actor: "USER" | "DRIVER" | "ADMIN") {
    const trip = await this.tripsRepo.findById(tripId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status === "CANCELED" || trip.status === "COMPLETED") {
      throw new BadRequestException(`Cannot cancel trip in status: ${trip.status}`);
    }

    await this.transitionStatus(tripId, "CANCELED", actor);
  }

  async updateTripData(
    tripId: string,
    data: {
      actualDistanceKm?: number;
      waitingMinutes?: number;
    },
  ) {
    const trip = await this.tripsRepo.findById(tripId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    // Update trip data (will be used before completion)
    await this.tripsRepo.updateTripData(tripId, data);
  }
}

