import { Module } from "@nestjs/common";
import { WarehouseSwaggerService } from "./common/swagger/swagger.service";
import { HealthController } from "./health.controller";

@Module({
  controllers: [HealthController],
  providers: [WarehouseSwaggerService],
})
export class AppModule {}
