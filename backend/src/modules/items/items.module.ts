import { DatabaseModule } from "@/database/database.module";
import { Module } from "@nestjs/common";
import { ItemController } from "./controllers/item.v1.controller";
import { GetItemBySkuService, SearchItemService } from "./services";

@Module({
  imports: [DatabaseModule],
  controllers: [ItemController],
  providers: [SearchItemService, GetItemBySkuService],
})
export class ItemsModule {}
