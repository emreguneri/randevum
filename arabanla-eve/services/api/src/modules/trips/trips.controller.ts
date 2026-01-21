import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { TripsService } from "./trips.service";
import { PaymentsService } from "../payments/payments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { TripMode, TimeMode } from "@arabanla-eve/shared";

@Controller("trips")
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  async createTrip(
    @Request() req: { user: { id: string } },
    @Body() body: {
      mode: TripMode;
      timeMode: TimeMode;
      pickupLat: number;
      pickupLng: number;
      dropoffLat: number;
      dropoffLng: number;
      estimatedDistanceKm?: number;
      estimatedDurationMin?: number;
      scheduledAt?: string;
      paymentMethodId: string;
    },
  ) {
    const trip = await this.tripsService.createTrip(req.user.id, {
      mode: body.mode,
      timeMode: body.timeMode,
      pickupLat: body.pickupLat,
      pickupLng: body.pickupLng,
      dropoffLat: body.dropoffLat,
      dropoffLng: body.dropoffLng,
      estimatedDistanceKm: body.estimatedDistanceKm,
      estimatedDurationMin: body.estimatedDurationMin,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });

    // Authorize payment
    await this.paymentsService.authorizeTrip(trip.id, body.paymentMethodId);

    return trip;
  }

  @Get()
  async getUserTrips(@Request() req: { user: { id: string } }) {
    return this.tripsService.getUserTrips(req.user.id);
  }

  @Get(":id")
  async getTrip(
    @Param("id") id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.tripsService.getTrip(id, req.user.id);
  }

  @Post(":id/authorize")
  async authorizeTrip(
    @Param("id") id: string,
    @Request() req: { user: { id: string } },
    @Body() body: { paymentMethodId: string },
  ) {
    return this.paymentsService.authorizeTrip(id, body.paymentMethodId);
  }

  @Post(":id/cancel")
  async cancelTrip(
    @Param("id") id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.tripsService.cancelTrip(id, "USER");
  }
}
