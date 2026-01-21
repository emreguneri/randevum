import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PricingConfig } from "../entities/pricing-config.entity";

@Injectable()
export class PricingConfigRepository {
  constructor(
    @InjectRepository(PricingConfig)
    private readonly repo: Repository<PricingConfig>,
  ) {}

  async findLatest(): Promise<PricingConfig | null> {
    return this.repo.findOne({
      where: {},
      order: { pricingVersion: "DESC" },
    });
  }

  async findByVersion(version: number): Promise<PricingConfig | null> {
    return this.repo.findOne({ where: { pricingVersion: version } });
  }

  async create(data: {
    taxiKmRateKurus: number;
    taxiMinuteRateKurus: number;
    kmRateKurus: number;
    waitRatePerMinKurus: number;
    commissionRate: number;
  }): Promise<PricingConfig> {
    const latest = await this.findLatest();
    const pricingVersion = latest ? latest.pricingVersion + 1 : 1;

    const config = this.repo.create({
      ...data,
      pricingVersion,
    });
    return this.repo.save(config);
  }
}

