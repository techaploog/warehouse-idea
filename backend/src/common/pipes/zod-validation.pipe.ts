import { ValidationException } from "@/common/exceptions";
import { PipeTransform } from "@nestjs/common";
import { z } from "zod";

export class ZodValidationPipe<TOutput> implements PipeTransform<unknown, TOutput> {
  constructor(private readonly schema: z.ZodType<TOutput>) {}

  transform(value: unknown): TOutput {
    const result = this.schema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    const message = result.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "body";
        return `${path}: ${issue.message}`;
      })
      .join("; ");

    throw new ValidationException(`Invalid request body: ${message}`);
  }
}
