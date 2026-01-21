import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { DriversService } from "./drivers.service";
import { TripsService } from "../trips/trips.service";
import { PaymentsService } from "../payments/payments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CANCEL_FEE_KURUS, NO_SHOW_FEE_KURUS, FREE_WAIT_MINUTES } from "@arabanla-eve/shared";

@Controller("drivers")
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly tripsService: TripsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post("onboarding")
  async onboardDriver(@Request() req: { user: { id: string } }) {
    return this.driversService.onboardDriver(req.user.id);
  }

  @Get("trips")
  async getDriverTrips(@Request() req: { user: { id: string } }) {
    const driver = await this.driversService.findByUserId(req.user.id);
    if (!driver) {
      throw new Error("Driver not found");
    }
    return this.tripsService.getDriverTrips(driver.id);
  }

  @Post("trips/:id/accept")
  async acceptTrip(
    @Param("id") id: string,
    @Request() req: { user: { id: string } },
  ) {
    const driver = await this.driversService.findByUserId(req.user.id);
    if (!driver) {
      throw new Error("Driver not found");
    }
    await this.tripsService.assignDriver(id, driver.id);
    return { success: true };
  }

  @Post("trips/:id/arrived")
  async arrived(
    @Param("id") id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.tripsService.transitionStatus(id, "DRIVER_ARRIVED", "DRIVER");
    return { success: true };
  }

  @Post("trips/:id/start")
  async startTrip(
    @Param("id") id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.tripsService.transitionStatus(id, "STARTED", "DRIVER");
    return { success: true };
  }

  @Post("trips/:id/complete")
  async completeTrip(
    @Param("id") id: string,
    @Request() req: { user: { id: string } },
    @Body() body: { actualDistanceKm: number; waitingMinutes: number },
  ) {
    const trip = await this.tripsService.getTrip(id);

    // Update trip with actual data
    // Note: In real implementation, this would come from GPS tracking
    await this.tripsService.updateTripData(id, {
      actualDistanceKm: body.actualDistanceKm,
      waitingMinutes: body.waitingMinutes,
    });

    // Transition to completed
    await this.tripsService.transitionStatus(id, "COMPLETED", "DRIVER");

    // Capture payment
    await this.paymentsService.captureTrip(id);

    return { success: true };
  }

  @Post("trips/:id/no-show")
  async noShow(
    @Param("id") id: string,
    @Request() req: { user: { id: string } },
    @Body() body: { waitingMinutes?: number },
  ) {
    const trip = await this.tripsService.getTrip(id);
    if (trip.status !== "DRIVER_ARRIVED") {
      throw new Error("No-show can only be reported after driver arrived");
    }

    const waitingFee = Math.max(
      0,
      Math.round((body.waitingMinutes || 0 - FREE_WAIT_MINUTES) * 907), // Default wait rate
    );
    const totalFee = NO_SHOW_FEE_KURUS + waitingFee;

    await this.paymentsService.captureCancelFee(id, totalFee);
    await this.tripsService.transitionStatus(id, "CANCELED", "DRIVER");

    return { success: true, feeKurus: totalFee };
  }
}

