import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import "dotenv/config";
import { AppModule } from "./app.module";
import { WarehouseSwaggerService } from "./common/swagger/swagger.service";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableShutdownHooks();

  app.get(WarehouseSwaggerService).setup(app);

  const port = Number(process.env.PORT ?? 3300);
  await app.listen({ port, host: "0.0.0.0" });

  logger.log(`Server started on port ${port}`);
  logger.log("Swagger docs available at /api/docs");
}

void bootstrap();
