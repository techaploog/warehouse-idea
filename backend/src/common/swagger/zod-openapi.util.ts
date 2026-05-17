import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { OpenAPIObject } from "@nestjs/swagger";
import { z, ZodTypeAny } from "zod";

extendZodWithOpenApi(z);

type OpenApiSchema = NonNullable<NonNullable<OpenAPIObject["components"]>["schemas"]>[string];

export const zodToOpenApiSchema = (name: string, schema: ZodTypeAny): OpenApiSchema => {
  const registry = new OpenAPIRegistry();
  registry.register(name, schema);

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const openApiSchema = generator.generateComponents().components?.schemas?.[name];

  if (!openApiSchema) {
    throw new Error(`Unable to generate OpenAPI schema for ${name}`);
  }

  return openApiSchema as unknown as OpenApiSchema;
};
