import { AbstractService } from "@/common/abstract-service/abstract.service";
import { DatabaseException } from "@/common/exceptions";
import type { TDatabase } from "@/database";
import { DB } from "@/database/database.constants";
import { itemMaster } from "@/database/schema";
import { Inject, Injectable } from "@nestjs/common";
import { SearchItem, searchItemResponseSchema, SearchItemResponse } from "@warehouse/shared";
import { and, asc, count, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { toItemResponse } from "./item-response.mapper";

@Injectable()
export class SearchItemService extends AbstractService<SearchItem, SearchItemResponse> {
  constructor(@Inject(DB) private readonly database: TDatabase) {
    super();
  }

  async execute(data: SearchItem): Promise<SearchItemResponse> {
    try {
      const where = this.buildWhere(data);
      const orderColumn = this.getOrderColumn(data.sortBy);
      const orderBy = data.sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);
      const offset = (data.page - 1) * data.limit;

      const [items, countRows] = await Promise.all([
        this.database
          .select()
          .from(itemMaster)
          .where(where)
          .orderBy(orderBy)
          .limit(data.limit)
          .offset(offset),
        this.database.select({ count: count() }).from(itemMaster).where(where),
      ]);

      const totalCount = countRows[0]?.count ?? 0;

      return searchItemResponseSchema.parse({
        data: items.map(toItemResponse),
        __meta__: {
          count: totalCount,
          page: data.page,
          limit: data.limit,
          totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / data.limit),
        },
      });
    } catch (error) {
      throw new DatabaseException("An error occurred while searching items", { cause: error });
    }
  }

  private buildWhere(data: SearchItem): SQL | undefined {
    const conditions: SQL[] = [];

    if (data.query) {
      const query = `%${data.query}%`;
      conditions.push(
        or(
          ilike(itemMaster.sku, query),
          ilike(itemMaster.barcode, query),
          ilike(itemMaster.name, query),
          ilike(itemMaster.description, query),
          ilike(itemMaster.tags, query),
          ilike(itemMaster.model, query),
          ilike(itemMaster.specification, query),
        )!,
      );
    }

    if (data.categoryId) conditions.push(eq(itemMaster.categoryId, data.categoryId));
    if (data.brandId) conditions.push(eq(itemMaster.brandId, data.brandId));
    if (data.supplierId) conditions.push(eq(itemMaster.supplierId, data.supplierId));
    if (data.unit) conditions.push(eq(itemMaster.unit, data.unit));
    if (data.isActive !== undefined) conditions.push(eq(itemMaster.isActive, data.isActive));

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private getOrderColumn(sortBy: SearchItem["sortBy"]): PgColumn {
    const columns = {
      sku: itemMaster.sku,
      name: itemMaster.name,
      unitPrice: itemMaster.unitPrice,
      createdAt: itemMaster.createdAt,
      updatedAt: itemMaster.updatedAt,
    };

    return columns[sortBy];
  }
}
