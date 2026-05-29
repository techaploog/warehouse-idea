import { describe, expect, it } from "vitest";

import { paginationMetaSchema } from "../pagination.schema";

const validMeta = { count: 0, page: 1, limit: 20, totalPages: 0 };

describe("paginationMetaSchema", () => {
  it("accepts a valid meta object", () => {
    expect(paginationMetaSchema.safeParse(validMeta).success).toBe(true);
  });

  it("rejects a negative count", () => {
    expect(paginationMetaSchema.safeParse({ ...validMeta, count: -1 }).success).toBe(false);
  });

  it("rejects a non-integer count", () => {
    expect(paginationMetaSchema.safeParse({ ...validMeta, count: 1.5 }).success).toBe(false);
  });

  it("rejects page = 0 (below min 1)", () => {
    expect(paginationMetaSchema.safeParse({ ...validMeta, page: 0 }).success).toBe(false);
  });

  it("rejects limit = 0 (below min 1)", () => {
    expect(paginationMetaSchema.safeParse({ ...validMeta, limit: 0 }).success).toBe(false);
  });

  it("rejects a negative totalPages", () => {
    expect(paginationMetaSchema.safeParse({ ...validMeta, totalPages: -1 }).success).toBe(false);
  });

  it("rejects a missing field", () => {
    const { totalPages: _omit, ...withoutTotalPages } = validMeta;
    expect(paginationMetaSchema.safeParse(withoutTotalPages).success).toBe(false);
  });
});
