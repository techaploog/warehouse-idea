import { Module } from "@nestjs/common";
import { WarehouseSwaggerService } from "./common/swagger/swagger.service";
import { HealthController } from "./health.controller";
import { ItemsModule } from "./modules/items/items.module";

@Module({
  imports: [ItemsModule],
  controllers: [HealthController],
  providers: [WarehouseSwaggerService],
})
export class AppModule {}
