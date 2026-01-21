import * as dotenv from "dotenv";

dotenv.config();

export const Config = {
  port: Number(process.env.PORT || 3000),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://arabanla:arabanla@localhost:5432/arabanla_eve",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  paymentProvider: (process.env.PAYMENT_PROVIDER || "mock") as "mock" | "iyzico",
};

