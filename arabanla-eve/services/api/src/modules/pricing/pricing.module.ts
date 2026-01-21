import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PricingService } from "./pricing.service";
import { PricingConfig } from "../../db/entities/pricing-config.entity";
import { PricingConfigRepository } from "../../db/repositories/pricing-config.repository";

@Module({
  imports: [TypeOrmModule.forFeature([PricingConfig])],
  providers: [PricingService, PricingConfigRepository],
  exports: [PricingService],
})
export class PricingModule {}

