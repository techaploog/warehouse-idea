import { z } from "zod";

export const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const itemsResponseSchema = z.object({
  items: z.array(itemSchema),
});

export type Item = z.infer<typeof itemSchema>;
export type ItemsResponse = z.infer<typeof itemsResponseSchema>;

