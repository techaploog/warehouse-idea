import { Controller, Get } from "@nestjs/common";
import { healthResponseSchema, type HealthResponse } from "@warehouse/shared";

@Controller("api/v1/health")
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return healthResponseSchema.parse({
      status: "ok",
      service: "warehouse-backend",
    });
  }
}
