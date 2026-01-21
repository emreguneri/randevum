import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PresenceController } from "./presence.controller";
import { PresenceService } from "./presence.service";
import { DriverPresence } from "../../db/entities/driver-presence.entity";
import { DriverPresenceRepository } from "../../db/repositories/driver-presence.repository";
import { DriversModule } from "../drivers/drivers.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([DriverPresence]),
    DriversModule,
  ],
  controllers: [PresenceController],
  providers: [PresenceService, DriverPresenceRepository],
  exports: [PresenceService],
})
export class PresenceModule {}

