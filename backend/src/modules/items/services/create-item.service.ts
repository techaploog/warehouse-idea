import { AbstractService } from "@/common/abstract-service/abstract.service";
import { DatabaseException } from "@/common/exceptions";
import type { TDatabase } from "@/database";
import { DB } from "@/database/database.constants";
import { itemMaster, TItemMasterInsert } from "@/database/schema";
import { DuplicateItemException } from "@/modules/items/exceptions";
import { Inject, Injectable } from "@nestjs/common";
import { CreateItem, CreateItemResponse, createItemResponseSchema } from "@warehouse/shared";
import { toItemResponse } from "./item-response.mapper";

type PostgresError = Error & {
  code?: string;
};

@Injectable()
export class CreateItemService extends AbstractService<CreateItem, CreateItemResponse> {
  constructor(@Inject(DB) private readonly database: TDatabase) {
    super();
  }

  async execute(data: CreateItem): Promise<CreateItemResponse> {
    try {
      const [item] = await this.database
        .insert(itemMaster)
        .values(this.toInsertItem(data))
        .returning();

      return createItemResponseSchema.parse({
        data: toItemResponse(item),
      });
    } catch (error) {
      if (this.isDuplicateError(error)) {
        throw new DuplicateItemException(`Item with SKU "${data.sku}" already exists`, {
          cause: error,
        });
      }

      throw new DatabaseException("An error occurred while creating item", { cause: error });
    }
  }

  private toInsertItem(data: CreateItem): TItemMasterInsert {
    return {
      sku: data.sku,
      barcode: data.barcode,
      name: data.name,
      description: data.description,
      tags: data.tags,
      categoryId: data.categoryId,
      brandId: data.brandId,
      model: data.model,
      specification: data.specification,
      unit: data.unit,
      unitPrice: data.unitPrice,
      supplierId: data.supplierId,
      effectiveFrom: this.toDateOrNull(data.effectiveFrom),
      effectiveTo: this.toDateOrNull(data.effectiveTo),
      orderLeadTime: data.orderLeadTime,
      remarks: data.remarks,
      isActive: data.isActive,
    };
  }

  private isDuplicateError(error: unknown): error is PostgresError {
    return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
  }

  private toDateOrNull(value: string | null | undefined): Date | null | undefined {
    if (value === undefined || value === null) {
      return value;
    }

    return new Date(value);
  }
}
