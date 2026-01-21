import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentsService } from "./payments.service";
import { PricingModule } from "../pricing/pricing.module";
import { Payment } from "../../db/entities/payment.entity";
import { Trip } from "../../db/entities/trip.entity";
import { LedgerEntry } from "../../db/entities/ledger-entry.entity";
import { PaymentsRepository } from "../../db/repositories/payments.repository";
import { TripsRepository } from "../../db/repositories/trips.repository";
import { LedgerEntriesRepository } from "../../db/repositories/ledger-entries.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Trip, LedgerEntry]),
    PricingModule,
  ],
  providers: [
    PaymentsService,
    PaymentsRepository,
    TripsRepository,
    LedgerEntriesRepository,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}

