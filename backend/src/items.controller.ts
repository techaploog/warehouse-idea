import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { itemsResponseSchema, type ItemsResponse } from "@warehouse/shared";

const SAMPLE_ITEMS: ItemsResponse = itemsResponseSchema.parse({
  items: [
    { id: "item-1", name: "Sample Item" },
    { id: "item-2", name: "Warehouse Tote" },
  ],
});

@ApiTags("items")
@Controller("api/v1/items")
export class ItemsController {
  @Get()
  @ApiOperation({ summary: "List items" })
  @ApiOkResponse({
    description: "Static item list",
    schema: {
      type: "object",
      required: ["items"],
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: { type: "string", example: "item-1" },
              name: { type: "string", example: "Sample Item" },
            },
          },
        },
      },
    },
  })
  listItems(): ItemsResponse {
    return SAMPLE_ITEMS;
  }
}
