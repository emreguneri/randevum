import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { PresenceService } from "./presence.service";
import { DriversService } from "../drivers/drivers.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("drivers/presence")
@UseGuards(JwtAuthGuard)
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly driversService: DriversService,
  ) {}

  @Post()
  async updatePresence(
    @Request() req: { user: { id: string } },
    @Body() body: {
      isOnline: boolean;
      lat?: number;
      lng?: number;
    },
  ) {
    const driver = await this.driversService.findByUserId(req.user.id);
    if (!driver) {
      throw new Error("Driver not found");
    }
    return this.presenceService.updatePresence(driver.id, body);
  }
}

