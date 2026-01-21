import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TripsService } from "./trips.service";
import { TripsController } from "./trips.controller";
import { Trip } from "../../db/entities/trip.entity";
import { TripEvent } from "../../db/entities/trip-event.entity";
import { TripsRepository } from "../../db/repositories/trips.repository";
import { TripEventsRepository } from "../../db/repositories/trip-events.repository";
import { PricingModule } from "../pricing/pricing.module";
import { PaymentsModule } from "../payments/payments.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, TripEvent]),
    PricingModule,
    PaymentsModule,
  ],
  controllers: [TripsController],
  providers: [TripsService, TripsRepository, TripEventsRepository],
  exports: [TripsService],
})
export class TripsModule {}

