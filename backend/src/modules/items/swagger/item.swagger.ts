import { zodToOpenApiSchema } from "@/common/swagger/zod-openapi.util";
import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";
import {
  createItemResponseSchema,
  createItemSchema,
  itemResponseSchema,
  searchItemResponseSchema,
  searchItemSchema,
} from "@warehouse/shared";

const sampleItem = {
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

const validationErrorExample = {
  statusCode: 400,
  code: "VALIDATION_ERROR",
  message: "Invalid request body: limit: Number must be less than or equal to 100",
};

const databaseErrorExample = {
  statusCode: 500,
  code: "DATABASE_ERROR",
  message: "An error occurred while accessing the database",
};

export const ItemSearchSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: "Search items" }),
    ApiBody({
      schema: zodToOpenApiSchema("SearchItemRequest", searchItemSchema),
      examples: {
        default: {
          value: {
            query: "tote",
            page: 1,
            limit: 20,
            sortBy: "updatedAt",
            sortOrder: "desc",
            isActive: true,
          },
        },
      },
    }),
    ApiOkResponse({
      description: "Search items successfully",
      schema: zodToOpenApiSchema("SearchItemResponse", searchItemResponseSchema),
      examples: {
        success: {
          summary: "Return matching items",
          value: {
            data: [sampleItem],
            __meta__: {
              count: 1,
              page: 1,
              limit: 20,
              totalPages: 1,
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({ description: "Invalid request body", example: validationErrorExample }),
    ApiInternalServerErrorResponse({
      description: "Database error",
      example: databaseErrorExample,
    }),
  );
};

export const ItemGetSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: "Get item by SKU" }),
    ApiOkResponse({
      description: "Get item successfully",
      schema: zodToOpenApiSchema("ItemResponse", itemResponseSchema),
      example: { data: sampleItem },
    }),
    ApiNotFoundResponse({
      description: "Item not found",
      example: {
        statusCode: 404,
        code: "ITEM_NOT_FOUND",
        message: 'Item with SKU "SKU-001" was not found',
      },
    }),
    ApiInternalServerErrorResponse({
      description: "Database error",
      example: databaseErrorExample,
    }),
  );
};

export const ItemCreateSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: "Create item" }),
    ApiBody({
      schema: zodToOpenApiSchema("CreateItemRequest", createItemSchema),
      examples: {
        default: {
          value: {
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
            orderLeadTime: 7,
            isActive: true,
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: "Create item successfully",
      schema: zodToOpenApiSchema("CreateItemResponse", createItemResponseSchema),
      example: { data: sampleItem },
    }),
    ApiBadRequestResponse({ description: "Invalid request body", example: validationErrorExample }),
    ApiConflictResponse({
      description: "Duplicate item",
      example: {
        statusCode: 409,
        code: "DUPLICATE_ITEM_ERROR",
        message: 'Item with SKU "SKU-001" already exists',
      },
    }),
    ApiInternalServerErrorResponse({
      description: "Database error",
      example: databaseErrorExample,
    }),
  );
};
