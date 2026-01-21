import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TripEvent } from "../entities/trip-event.entity";
import type { TripStatus } from "@arabanla-eve/shared";

@Injectable()
export class TripEventsRepository {
  constructor(
    @InjectRepository(TripEvent)
    private readonly repo: Repository<TripEvent>,
  ) {}

  async findByTripId(tripId: string): Promise<TripEvent[]> {
    return this.repo.find({
      where: { tripId },
      order: { createdAt: "ASC" },
    });
  }

  async create(data: {
    tripId: string;
    status: TripStatus;
    actor: "SYSTEM" | "USER" | "DRIVER" | "ADMIN";
    metadata?: Record<string, any>;
  }): Promise<TripEvent> {
    const event = this.repo.create(data);
    return this.repo.save(event);
  }
}

