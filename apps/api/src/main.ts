import * as fs from "fs";
import * as path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {}

import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ErrorInterceptor } from "./shared/interceptors/error.interceptor";
import { ResponseInterceptor } from "./shared/interceptors/response.interceptor";
import fastifyCors from "@fastify/cors";

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: true });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

  await app.register(fastifyCors, {
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  });

  app.setGlobalPrefix("api/v1");
  app.useGlobalInterceptors(new ResponseInterceptor(), new ErrorInterceptor());

  const config = new DocumentBuilder()
    .setTitle("School Management System API")
    .setDescription("Enterprise SMS Modular Monolith REST API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.API_PORT || 4000;
  await app.listen(port, "0.0.0.0");
  console.log(`[SMS-API] Application listening on port ${port}`);
}

bootstrap();
