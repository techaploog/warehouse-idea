import { SearchItemService } from "@/modules/items/services";
import { ItemSearchSwagger } from "@/modules/items/swagger";
import { Body, Controller, Get, Logger, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("items")
@Controller("api/v1/items")
export class ItemController {
  private readonly logger = new Logger(ItemController.name);

  constructor(
    private readonly searchItemService: SearchItemService,
    private readonly getItemBySkuService: GetItemBySkuService,
  ) {}

  @Post("search")
  @ItemSearchSwagger()
  async itemSearch(@Body() dto: SearchItemSchema): Promise<SearchItemResponse> {
    return this.searchItemService.searchItems(dto);
  }

  @Get("/:sku")
  @ItemGetSwagger()
  async itemGetBySku(@Param("sku") sku: string): Promise<ItemResponse> {
    return this.getItemBySkuService.getItem(sku);
  }
}
