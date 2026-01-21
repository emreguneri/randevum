import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchingService } from "./matching.service";
import { Trip } from "../../db/entities/trip.entity";
import { Driver } from "../../db/entities/driver.entity";
import { DriverPresence } from "../../db/entities/driver-presence.entity";
import { TripsRepository } from "../../db/repositories/trips.repository";
import { DriverPresenceRepository } from "../../db/repositories/driver-presence.repository";
import { DriversRepository } from "../../db/repositories/drivers.repository";
import { TripsModule } from "../trips/trips.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Driver, DriverPresence]),
    TripsModule,
  ],
  providers: [
    MatchingService,
    TripsRepository,
    DriverPresenceRepository,
    DriversRepository,
  ],
  exports: [MatchingService],
})
export class MatchingModule {}

