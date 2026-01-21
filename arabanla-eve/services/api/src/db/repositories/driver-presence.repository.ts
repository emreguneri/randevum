import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DriverPresence } from "../entities/driver-presence.entity";

@Injectable()
export class DriverPresenceRepository {
  constructor(
    @InjectRepository(DriverPresence)
    private readonly repo: Repository<DriverPresence>,
  ) {}

  async findByDriverId(driverId: string): Promise<DriverPresence | null> {
    return this.repo.findOne({ where: { driverId } });
  }

  async createOrUpdate(driverId: string, data: {
    isOnline?: boolean;
    lat?: number | null;
    lng?: number | null;
  }): Promise<DriverPresence> {
    let presence = await this.findByDriverId(driverId);
    if (!presence) {
      presence = this.repo.create({ driverId, ...data });
    } else {
      Object.assign(presence, data);
      presence.lastSeen = new Date();
    }
    return this.repo.save(presence);
  }

  async updateLastSeen(driverId: string): Promise<void> {
    await this.repo.update({ driverId }, { lastSeen: new Date() });
  }
}

