import { TItemMaster } from "@/database/schema";
import { itemSchema, type Item } from "@warehouse/shared";

const toIsoStringOrNull = (value: Date | null): string | null => {
  return value ? value.toISOString() : null;
};

export const toItemResponse = (item: TItemMaster): Item => {
  return itemSchema.parse({
    ...item,
    effectiveFrom: toIsoStringOrNull(item.effectiveFrom),
    effectiveTo: toIsoStringOrNull(item.effectiveTo),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
};
