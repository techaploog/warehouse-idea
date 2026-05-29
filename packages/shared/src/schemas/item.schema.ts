import { z } from "zod";
import { paginationMetaSchema } from "./pagination.schema";

const nullableStringSchema = z.string().nullable();
const optionalNullableStringSchema = z.string().nullable().optional();
const isoDatetimeSchema = z.string().datetime();
const decimalStringSchema = z.string().regex(/^\d+(\.\d{1,2})?$/, "Expected a decimal string");

export const itemSchema = z.object({
  sku: z.string().min(1),
  barcode: nullableStringSchema,
  name: z.string().min(1),
  description: nullableStringSchema,
  tags: nullableStringSchema,
  categoryId: nullableStringSchema,
  brandId: nullableStringSchema,
  model: nullableStringSchema,
  specification: nullableStringSchema,
  unit: nullableStringSchema,
  unitPrice: decimalStringSchema,
  supplierId: nullableStringSchema,
  effectiveFrom: isoDatetimeSchema.nullable(),
  effectiveTo: isoDatetimeSchema.nullable(),
  orderLeadTime: z.number().int().min(0),
  remarks: nullableStringSchema,
  createdAt: isoDatetimeSchema,
  updatedAt: isoDatetimeSchema,
  isActive: z.boolean(),
});

export const createItemSchema = z.object({
  sku: z.string().trim().min(1).max(100),
  barcode: optionalNullableStringSchema,
  name: z.string().trim().min(1),
  description: optionalNullableStringSchema,
  tags: optionalNullableStringSchema,
  categoryId: optionalNullableStringSchema,
  brandId: optionalNullableStringSchema,
  model: optionalNullableStringSchema,
  specification: optionalNullableStringSchema,
  unit: optionalNullableStringSchema,
  unitPrice: decimalStringSchema.optional().default("0.00"),
  supplierId: optionalNullableStringSchema,
  effectiveFrom: isoDatetimeSchema.nullable().optional(),
  effectiveTo: isoDatetimeSchema.nullable().optional(),
  orderLeadTime: z.number().int().min(0).optional().default(0),
  remarks: optionalNullableStringSchema,
  isActive: z.boolean().optional().default(true),
});

export const searchItemSortBySchema = z.enum([
  "sku",
  "name",
  "unitPrice",
  "createdAt",
  "updatedAt",
]);
export const sortOrderSchema = z.enum(["asc", "desc"]);

export const searchItemSchema = z.object({
  query: z.string().trim().optional().default(""),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: searchItemSortBySchema.optional().default("updatedAt"),
  sortOrder: sortOrderSchema.optional().default("desc"),
  categoryId: optionalNullableStringSchema,
  brandId: optionalNullableStringSchema,
  supplierId: optionalNullableStringSchema,
  unit: optionalNullableStringSchema,
  isActive: z.boolean().optional(),
});

export const itemResponseSchema = z.object({
  data: itemSchema,
});

export const createItemResponseSchema = itemResponseSchema;

export const searchItemResponseSchema = z.object({
  data: z.array(itemSchema),
  __meta__: paginationMetaSchema,
});

export const itemsResponseSchema = searchItemResponseSchema;

export type Item = z.infer<typeof itemSchema>;
export type CreateItem = z.infer<typeof createItemSchema>;
export type SearchItem = z.infer<typeof searchItemSchema>;
export type ItemResponse = z.infer<typeof itemResponseSchema>;
export type CreateItemResponse = z.infer<typeof createItemResponseSchema>;
export type SearchItemResponse = z.infer<typeof searchItemResponseSchema>;
export type ItemsResponse = z.infer<typeof itemsResponseSchema>;
