import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Trip } from "../entities/trip.entity";
import type { TripStatus, PaymentStatus, TripMode, TimeMode } from "@arabanla-eve/shared";

@Injectable()
export class TripsRepository {
  constructor(
    @InjectRepository(Trip)
    private readonly repo: Repository<Trip>,
  ) {}

  async findById(id: string): Promise<Trip | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["user", "driver", "events", "payments"],
    });
  }

  async findByUserId(userId: string, limit = 50): Promise<Trip[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
      relations: ["driver"],
    });
  }

  async findByDriverId(driverId: string, limit = 50): Promise<Trip[]> {
    return this.repo.find({
      where: { driverId },
      order: { createdAt: "DESC" },
      take: limit,
      relations: ["user"],
    });
  }

  async findActiveByDriverId(driverId: string): Promise<Trip | null> {
    return this.repo.findOne({
      where: {
        driverId,
        status: In(["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "STARTED"]),
      },
    });
  }

  async create(data: {
    userId: string;
    mode: TripMode;
    timeMode: TimeMode;
    pricingVersion: number;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    estimatedDistanceKm?: number;
    estimatedDurationMin?: number;
    scheduledAt?: Date;
  }): Promise<Trip> {
    const trip = this.repo.create({
      ...data,
      status: "REQUESTED" as TripStatus,
      paymentStatus: "NONE" as PaymentStatus,
    });
    return this.repo.save(trip);
  }

  async updateStatus(id: string, status: TripStatus): Promise<void> {
    await this.repo.update({ id }, { status });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void> {
    await this.repo.update({ id }, { paymentStatus });
  }

  async assignDriver(id: string, driverId: string): Promise<void> {
    await this.repo.update({ id }, { driverId, status: "DRIVER_ASSIGNED" as TripStatus });
  }

  async updateTripData(
    id: string,
    data: {
      actualDistanceKm?: number;
      waitingMinutes?: number;
    },
  ): Promise<void> {
    await this.repo.update({ id }, data);
  }

  async updateCompletionData(
    id: string,
    data: {
      actualDistanceKm: number;
      waitingMinutes: number;
      fareKurus: number;
      platformFeeKurus: number;
      driverEarningsKurus: number;
    },
  ): Promise<void> {
    await this.repo.update({ id }, { ...data, status: "COMPLETED" as TripStatus });
  }
}

