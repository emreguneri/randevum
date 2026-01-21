import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PricingService } from "../pricing/pricing.service";
import { createPaymentProvider } from "../../providers/payments/payment-provider.factory";
import { PaymentProvider } from "../../providers/payments/payment-provider.interface";
import { PaymentsRepository } from "../../db/repositories/payments.repository";
import { TripsRepository } from "../../db/repositories/trips.repository";
import { LedgerEntriesRepository } from "../../db/repositories/ledger-entries.repository";
import { Config } from "../../config/env";
import type { PaymentStatus } from "@arabanla-eve/shared";

@Injectable()
export class PaymentsService {
  private provider: PaymentProvider;

  constructor(
    private readonly pricingService: PricingService,
    private readonly paymentsRepo: PaymentsRepository,
    private readonly tripsRepo: TripsRepository,
    private readonly ledgerRepo: LedgerEntriesRepository,
  ) {
    this.provider = createPaymentProvider();
  }

  async authorizeTrip(tripId: string, paymentMethodId: string) {
    const trip = await this.tripsRepo.findById(tripId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== "REQUESTED") {
      throw new BadRequestException(`Cannot authorize payment for trip in status: ${trip.status}`);
    }

    const config = await this.pricingService.getConfig(trip.pricingVersion);
    const estimatedFare = this.pricingService.calculateEstimatedFare(
      trip.estimatedDistanceKm || 0,
      trip.estimatedDurationMin || 0,
      config,
    );
    const authAmount = this.pricingService.calculatePreauthAmount(estimatedFare, config);

    try {
      const result = await this.provider.authorize(authAmount, {
        tripId,
        paymentMethodId,
      });

      if (result.status === "DECLINED") {
        await this.paymentsRepo.create({
          tripId,
          provider: Config.paymentProvider,
          status: "FAILED",
          amountKurus: authAmount,
        });
        throw new BadRequestException("Payment authorization declined");
      }

      await this.paymentsRepo.create({
        tripId,
        provider: Config.paymentProvider,
        status: "AUTHORIZED",
        amountKurus: authAmount,
        authId: result.authId,
      });

      await this.tripsRepo.updatePaymentStatus(tripId, "AUTHORIZED");
      await this.tripsRepo.updateStatus(tripId, "AUTHORIZED" as any);

      return { success: true, authId: result.authId };
    } catch (error) {
      await this.paymentsRepo.create({
        tripId,
        provider: Config.paymentProvider,
        status: "FAILED",
        amountKurus: authAmount,
      });
      throw error;
    }
  }

  async captureTrip(tripId: string) {
    const trip = await this.tripsRepo.findById(tripId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (trip.status !== "STARTED") {
      throw new BadRequestException(`Cannot capture payment for trip in status: ${trip.status}`);
    }

    const authPayment = await this.paymentsRepo.findAuthorizationByTripId(tripId);
    if (!authPayment || !authPayment.authId) {
      throw new BadRequestException("No authorization found for trip");
    }

    const config = await this.pricingService.getConfig(trip.pricingVersion);
    const breakdown = this.pricingService.calculateFinalFare(
      trip.actualDistanceKm || 0,
      trip.waitingMinutes || 0,
      config,
    );

    // Guardrail: cap final to auth amount
    const finalAmount = Math.min(breakdown.totalKurus, authPayment.amountKurus);

    try {
      const result = await this.provider.capture(authPayment.authId, finalAmount);

      if (result.status === "FAILED") {
        await this.paymentsRepo.updateStatus(authPayment.id, "FAILED");
        throw new BadRequestException("Payment capture failed");
      }

      await this.paymentsRepo.updateCaptureId(authPayment.id, result.captureId);
      await this.paymentsRepo.updateStatus(authPayment.id, "CAPTURED");

      // Update trip with final amounts
      await this.tripsRepo.updateCompletionData(tripId, {
        actualDistanceKm: trip.actualDistanceKm || 0,
        waitingMinutes: trip.waitingMinutes || 0,
        fareKurus: finalAmount,
        platformFeeKurus: breakdown.platformFeeKurus,
        driverEarningsKurus: breakdown.driverEarningsKurus,
      });

      // Create ledger entries
      await this.ledgerRepo.create({
        tripId,
        account: "USER",
        amountKurus: -finalAmount,
      });
      await this.ledgerRepo.create({
        tripId,
        account: "PLATFORM",
        amountKurus: breakdown.platformFeeKurus,
      });
      await this.ledgerRepo.create({
        tripId,
        account: "DRIVER",
        amountKurus: breakdown.driverEarningsKurus,
      });

      await this.tripsRepo.updatePaymentStatus(tripId, "SPLIT_RECORDED");

      return {
        success: true,
        captureId: result.captureId,
        breakdown,
      };
    } catch (error) {
      await this.paymentsRepo.updateStatus(authPayment.id, "FAILED");
      throw error;
    }
  }

  async captureCancelFee(tripId: string, feeKurus: number) {
    const trip = await this.tripsRepo.findById(tripId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    const authPayment = await this.paymentsRepo.findAuthorizationByTripId(tripId);
    if (!authPayment || !authPayment.authId) {
      throw new BadRequestException("No authorization found for trip");
    }

    try {
      const result = await this.provider.capture(authPayment.authId, feeKurus);

      if (result.status === "FAILED") {
        throw new BadRequestException("Cancel fee capture failed");
      }

      await this.paymentsRepo.updateCaptureId(authPayment.id, result.captureId);
      await this.paymentsRepo.updateStatus(authPayment.id, "CAPTURED");

      // Create ledger entries
      await this.ledgerRepo.create({
        tripId,
        account: "USER",
        amountKurus: -feeKurus,
      });
      await this.ledgerRepo.create({
        tripId,
        account: "PLATFORM",
        amountKurus: feeKurus,
      });

      return { success: true, captureId: result.captureId };
    } catch (error) {
      throw error;
    }
  }
}

