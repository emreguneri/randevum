import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DefaultNamingStrategy } from "typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DriversModule } from "./modules/drivers/drivers.module";
import { PresenceModule } from "./modules/presence/presence.module";
import { TripsModule } from "./modules/trips/trips.module";
import { MatchingModule } from "./modules/matching/matching.module";
import { PricingModule } from "./modules/pricing/pricing.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PayoutsModule } from "./modules/payouts/payouts.module";
import { DisputesModule } from "./modules/disputes/disputes.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Config } from "./config/env";
import * as entities from "./db/entities";

// Custom naming strategy to convert camelCase to snake_case
class SnakeNamingStrategy extends DefaultNamingStrategy {
  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    if (customName) return customName;
    const name = embeddedPrefixes.concat(propertyName).join("_");
    return name.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`).replace(/^_/, "");
  }
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: Config.databaseUrl,
      entities: Object.values(entities),
      synchronize: false, // Use migrations
      logging: process.env.NODE_ENV === "development",
      namingStrategy: new SnakeNamingStrategy(),
    }),
    AuthModule,
    UsersModule,
    DriversModule,
    PresenceModule,
    TripsModule,
    MatchingModule,
    PricingModule,
    PaymentsModule,
    PayoutsModule,
    DisputesModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

