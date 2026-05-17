import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { healthResponseSchema, type HealthResponse } from "@warehouse/shared";

@ApiTags("health")
@Controller("api/health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Health check" })
  @ApiOkResponse({
    description: "Service health",
    schema: {
      type: "object",
      required: ["status", "service"],
      properties: {
        status: { type: "string", example: "ok" },
        service: { type: "string", example: "warehouse-backend" },
      },
    },
  })
  getHealth(): HealthResponse {
    return healthResponseSchema.parse({
      status: "ok",
      service: "warehouse-backend",
    });
  }
}
