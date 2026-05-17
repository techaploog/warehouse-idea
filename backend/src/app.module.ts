import { Module } from "@nestjs/common";
import { WarehouseSwaggerService } from "./common/swagger/swagger.service";
import { HealthController } from "./health.controller";
import { ItemsController } from "./items.controller";

@Module({
  controllers: [HealthController, ItemsController],
  providers: [WarehouseSwaggerService],
})
export class AppModule {}
