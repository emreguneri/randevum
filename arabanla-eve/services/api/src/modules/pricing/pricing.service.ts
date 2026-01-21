import { Injectable } from "@nestjs/common";
import {
  BASE_FARE_KURUS,
  COMMISSION_RATE,
  DEFAULT_KM_RATE_KURUS,
  DEFAULT_WAIT_RATE_PER_MIN_KURUS,
  PREAUTH_BUFFER_RATE,
  FREE_WAIT_MINUTES,
  type TripPricingBreakdown,
} from "@arabanla-eve/shared";
import { PricingConfigRepository } from "../../db/repositories/pricing-config.repository";

export interface PricingConfig {
  pricingVersion: number;
  baseFareKurus: number;
  kmRateKurus: number;
  waitRatePerMinKurus: number;
  commissionRate: number;
  preauthBufferRate: number;
}

@Injectable()
export class PricingService {
  constructor(private readonly pricingConfigRepo: PricingConfigRepository) {}

  async getConfig(version?: number): Promise<PricingConfig> {
    let config;
    if (version) {
      config = await this.pricingConfigRepo.findByVersion(version);
    } else {
      config = await this.pricingConfigRepo.findLatest();
    }

    if (config) {
      return {
        pricingVersion: config.pricingVersion,
        baseFareKurus: BASE_FARE_KURUS,
        kmRateKurus: config.kmRateKurus,
        waitRatePerMinKurus: config.waitRatePerMinKurus,
        commissionRate: Number(config.commissionRate),
        preauthBufferRate: PREAUTH_BUFFER_RATE,
      };
    }

    // Fallback to defaults
    return {
      pricingVersion: 1,
      baseFareKurus: BASE_FARE_KURUS,
      kmRateKurus: DEFAULT_KM_RATE_KURUS,
      waitRatePerMinKurus: DEFAULT_WAIT_RATE_PER_MIN_KURUS,
      commissionRate: COMMISSION_RATE,
      preauthBufferRate: PREAUTH_BUFFER_RATE,
    };
  }

  async getLatestConfig(): Promise<PricingConfig> {
    return this.getConfig();
  }

  calculateEstimatedFare(
    distanceKm: number,
    durationMin: number,
    config: PricingConfig,
  ): number {
    const base = config.baseFareKurus;
    const distanceFare = Math.round(distanceKm * config.kmRateKurus);
    // No waiting fee for estimated (only actual waiting counts)
    return base + distanceFare;
  }

  calculateFinalFare(
    actualDistanceKm: number,
    waitingMinutes: number,
    config: PricingConfig,
  ): TripPricingBreakdown {
    const baseFareKurus = config.baseFareKurus;
    const distanceKurus = Math.round(actualDistanceKm * config.kmRateKurus);
    const waitingKurus = Math.max(
      0,
      Math.round((waitingMinutes - FREE_WAIT_MINUTES) * config.waitRatePerMinKurus),
    );
    const totalKurus = baseFareKurus + distanceKurus + waitingKurus;
    const platformFeeKurus = Math.round(totalKurus * config.commissionRate);
    const driverEarningsKurus = totalKurus - platformFeeKurus;

    return {
      baseFareKurus,
      distanceKurus,
      waitingKurus,
      totalKurus,
      platformFeeKurus,
      driverEarningsKurus,
    };
  }

  calculatePreauthAmount(estimatedFare: number, config: PricingConfig): number {
    return Math.round(estimatedFare * (1 + config.preauthBufferRate));
  }
}

