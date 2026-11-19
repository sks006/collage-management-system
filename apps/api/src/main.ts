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
