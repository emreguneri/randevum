import { Injectable } from "@nestjs/common";
import { DriversRepository } from "../../db/repositories/drivers.repository";
import { TripsRepository } from "../../db/repositories/trips.repository";

@Injectable()
export class DriversService {
  constructor(
    private readonly driversRepo: DriversRepository,
    private readonly tripsRepo: TripsRepository,
  ) {}

  async findByUserId(userId: string) {
    return this.driversRepo.findByUserId(userId);
  }

  async onboardDriver(userId: string) {
    let driver = await this.driversRepo.findByUserId(userId);
    if (!driver) {
      driver = await this.driversRepo.create(userId, "PENDING");
    }
    return driver;
  }

  async getDriverTrips(driverId: string) {
    return this.tripsRepo.findByDriverId(driverId);
  }
}

