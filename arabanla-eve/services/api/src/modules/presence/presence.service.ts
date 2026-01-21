import { Injectable } from "@nestjs/common";
import { DriverPresenceRepository } from "../../db/repositories/driver-presence.repository";

@Injectable()
export class PresenceService {
  constructor(private readonly presenceRepo: DriverPresenceRepository) {}

  async updatePresence(
    driverId: string,
    data: {
      isOnline: boolean;
      lat?: number;
      lng?: number;
    },
  ) {
    return this.presenceRepo.createOrUpdate(driverId, data);
  }

  async updateLocation(driverId: string, lat: number, lng: number) {
    return this.presenceRepo.createOrUpdate(driverId, {
      isOnline: true,
      lat,
      lng,
    });
  }
}

