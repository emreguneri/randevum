import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DriversController } from "./drivers.controller";
import { DriversService } from "./drivers.service";
import { Driver } from "../../db/entities/driver.entity";
import { Trip } from "../../db/entities/trip.entity";
import { DriversRepository } from "../../db/repositories/drivers.repository";
import { TripsRepository } from "../../db/repositories/trips.repository";
import { TripsModule } from "../trips/trips.module";
import { PaymentsModule } from "../payments/payments.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver, Trip]),
    TripsModule,
    PaymentsModule,
  ],
  controllers: [DriversController],
  providers: [DriversService, DriversRepository, TripsRepository],
  exports: [DriversService],
})
export class DriversModule {}

