import { Injectable } from "@nestjs/common";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

@Injectable()
export class WarehouseSwaggerService {
  setup(app: NestFastifyApplication) {
    const config = new DocumentBuilder()
      .setTitle("Warehouse Idea API")
      .setDescription("Backend API documentation for Warehouse Idea.")
      .setVersion("1.0")
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("api/docs", app, document);

    return document;
  }
}
