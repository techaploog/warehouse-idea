import { ZodValidationPipe } from "@/common/pipes";
import {
  CreateItemService,
  GetItemBySkuService,
  SearchItemService,
} from "@/modules/items/services";
import { ItemCreateSwagger, ItemGetSwagger, ItemSearchSwagger } from "@/modules/items/swagger";
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  createItemSchema,
  searchItemSchema,
  type CreateItem,
  type CreateItemResponse,
  type ItemResponse,
  type SearchItem,
  type SearchItemResponse,
} from "@warehouse/shared";

@ApiTags("items")
@Controller("api/v1/items")
export class ItemController {
  private readonly logger = new Logger(ItemController.name);

  constructor(
    private readonly searchItemService: SearchItemService,
    private readonly getItemBySkuService: GetItemBySkuService,
    private readonly createItemService: CreateItemService,
  ) {}

  @Post("search")
  @HttpCode(HttpStatus.OK)
  @ItemSearchSwagger()
  async itemSearch(
    @Body(new ZodValidationPipe(searchItemSchema)) dto: SearchItem,
  ): Promise<SearchItemResponse> {
    return this.searchItemService.execute(dto);
  }

  @Get("/:sku")
  @ItemGetSwagger()
  async itemGetBySku(@Param("sku") sku: string): Promise<ItemResponse> {
    return this.getItemBySkuService.execute(sku);
  }

  @Post()
  @ItemCreateSwagger()
  async itemCreate(
    @Body(new ZodValidationPipe(createItemSchema)) dto: CreateItem,
  ): Promise<CreateItemResponse> {
    return await this.createItemService.execute(dto);
  }
}
