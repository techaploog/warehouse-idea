import { z } from "zod";

export const paginationMetaSchema = z.object({
  count: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});
