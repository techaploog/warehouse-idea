import { describe, expect, it } from "vitest";

import {
  createItemSchema,
  itemResponseSchema,
  itemSchema,
  searchItemResponseSchema,
  searchItemSchema,
  searchItemSortBySchema,
  sortOrderSchema,
} from "../item.schema";

const validItem = {
  sku: "SKU-001",
  barcode: "8850000000012",
  name: "Warehouse Tote",
  description: "Reusable storage tote",
  tags: "storage,tote",
  categoryId: "category1",
  brandId: "brand1",
  model: "TOTE-45",
  specification: "45L",
  unit: "PCS",
  unitPrice: "199.00",
  supplierId: "supplier1",
  effectiveFrom: null,
  effectiveTo: null,
  orderLeadTime: 7,
  remarks: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  isActive: true,
};

const validMeta = { count: 1, page: 1, limit: 20, totalPages: 1 };

describe("itemSchema", () => {
  it("accepts a fully-populated item", () => {
    expect(itemSchema.safeParse(validItem).success).toBe(true);
  });

  it("rejects an empty sku", () => {
    expect(itemSchema.safeParse({ ...validItem, sku: "" }).success).toBe(false);
  });

  it("rejects an empty name", () => {
    expect(itemSchema.safeParse({ ...validItem, name: "" }).success).toBe(false);
  });

  it("rejects unitPrice with more than 2 decimals", () => {
    expect(itemSchema.safeParse({ ...validItem, unitPrice: "1.234" }).success).toBe(false);
  });

  it("rejects unitPrice that is not a numeric string", () => {
    expect(itemSchema.safeParse({ ...validItem, unitPrice: "abc" }).success).toBe(false);
  });

  it("rejects a non-ISO createdAt", () => {
    expect(itemSchema.safeParse({ ...validItem, createdAt: "yesterday" }).success).toBe(false);
  });

  it("rejects a negative orderLeadTime", () => {
    expect(itemSchema.safeParse({ ...validItem, orderLeadTime: -1 }).success).toBe(false);
  });

  it("rejects a non-integer orderLeadTime", () => {
    expect(itemSchema.safeParse({ ...validItem, orderLeadTime: 1.5 }).success).toBe(false);
  });

  it("accepts null for nullable fields", () => {
    const withNulls = { ...validItem, barcode: null, description: null, categoryId: null };
    expect(itemSchema.safeParse(withNulls).success).toBe(true);
  });
});

describe("createItemSchema", () => {
  it("applies defaults for optional fields", () => {
    const result = createItemSchema.parse({ sku: "SKU-002", name: "Box" });
    expect(result.unitPrice).toBe("0.00");
    expect(result.orderLeadTime).toBe(0);
    expect(result.isActive).toBe(true);
  });

  it("trims whitespace from sku and name", () => {
    const result = createItemSchema.parse({ sku: "  SKU-003  ", name: "  Box  " });
    expect(result.sku).toBe("SKU-003");
    expect(result.name).toBe("Box");
  });

  it("rejects a sku longer than 100 characters", () => {
    const longSku = "A".repeat(101);
    expect(createItemSchema.safeParse({ sku: longSku, name: "Box" }).success).toBe(false);
  });

  it("rejects a sku that is only whitespace (trims to empty)", () => {
    expect(createItemSchema.safeParse({ sku: "   ", name: "Box" }).success).toBe(false);
  });

  it("rejects a name that trims to empty", () => {
    expect(createItemSchema.safeParse({ sku: "SKU-004", name: "   " }).success).toBe(false);
  });
});

describe("searchItemSchema", () => {
  it("applies defaults for an empty input", () => {
    const result = searchItemSchema.parse({});
    expect(result.query).toBe("");
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortBy).toBe("updatedAt");
    expect(result.sortOrder).toBe("desc");
  });

  it("rejects page < 1", () => {
    expect(searchItemSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(searchItemSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects an unknown sortBy value", () => {
    expect(searchItemSchema.safeParse({ sortBy: "color" }).success).toBe(false);
  });

  it("rejects an unknown sortOrder value", () => {
    expect(searchItemSchema.safeParse({ sortOrder: "ASC" }).success).toBe(false);
  });
});

describe("searchItemSortBySchema and sortOrderSchema", () => {
  it("sortBy accepts each allowed value", () => {
    for (const v of ["sku", "name", "unitPrice", "createdAt", "updatedAt"] as const) {
      expect(searchItemSortBySchema.safeParse(v).success).toBe(true);
    }
  });

  it("sortOrder is case-sensitive (rejects uppercase)", () => {
    expect(sortOrderSchema.safeParse("DESC").success).toBe(false);
  });
});

describe("response schemas", () => {
  it("itemResponseSchema accepts a wrapped item", () => {
    expect(itemResponseSchema.safeParse({ data: validItem }).success).toBe(true);
  });

  it("itemResponseSchema rejects a missing data field", () => {
    expect(itemResponseSchema.safeParse({}).success).toBe(false);
  });

  it("searchItemResponseSchema accepts a paginated list", () => {
    const result = searchItemResponseSchema.safeParse({
      data: [validItem],
      __meta__: validMeta,
    });
    expect(result.success).toBe(true);
  });

  it("searchItemResponseSchema rejects a missing __meta__", () => {
    expect(searchItemResponseSchema.safeParse({ data: [validItem] }).success).toBe(false);
  });

  it("searchItemResponseSchema rejects a non-array data", () => {
    expect(
      searchItemResponseSchema.safeParse({ data: validItem, __meta__: validMeta }).success,
    ).toBe(false);
  });
});
