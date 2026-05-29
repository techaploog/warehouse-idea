import { AbstractService } from "@/common/abstract-service/abstract.service";
import { DatabaseException } from "@/common/exceptions";
import type { TDatabase } from "@/database";
import { DB } from "@/database/database.constants";
import { itemMaster } from "@/database/schema";
import { ItemNotFoundException } from "@/modules/items/exceptions";
import { Inject, Injectable } from "@nestjs/common";
import { ItemResponse, itemResponseSchema } from "@warehouse/shared";
import { eq } from "drizzle-orm";
import { toItemResponse } from "../mapper/item-response.mapper";

@Injectable()
export class GetItemBySkuService extends AbstractService<string, ItemResponse> {
  constructor(@Inject(DB) private readonly database: TDatabase) {
    super();
  }

  async execute(sku: string): Promise<ItemResponse> {
    try {
      const [item] = await this.database
        .select()
        .from(itemMaster)
        .where(eq(itemMaster.sku, sku))
        .limit(1);

      if (!item) {
        throw new ItemNotFoundException(`Item with SKU "${sku}" was not found`);
      }

      return itemResponseSchema.parse({
        data: toItemResponse(item),
      });
    } catch (error) {
      if (error instanceof ItemNotFoundException) {
        throw error;
      }

      throw new DatabaseException("An error occurred while getting item by SKU", { cause: error });
    }
  }
}
