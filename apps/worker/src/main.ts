import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";
import { logger } from "./shared/logger";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  logger.info("[SMS-Worker] Background job processor running (SKIP LOCKED engine active)");
}

bootstrap();
