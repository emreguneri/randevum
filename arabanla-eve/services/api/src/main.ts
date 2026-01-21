import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Config } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["log", "error"] });
  
  // Enable CORS for mobile apps
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = Config.port;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start API", err);
  process.exit(1);
});

