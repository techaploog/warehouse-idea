import { db } from "@/database/database.constants";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SearchItemService implements AbstractService<SearchItemSchema, SearchItemResponse> {
  async execute(data: SearchItemSchema): Promise<SearchItemResponse> {
    const result = await db.select().from(items).execute();
    return {
      data: result,
      __meta__: {
        count: 0, // total item cout
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    };
  }
}
