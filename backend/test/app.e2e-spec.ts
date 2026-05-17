import { DB } from "@/database/database.constants";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./../src/app.module";

const sampleDbItem = {
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
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  isActive: true,
};

const sampleApiItem = {
  ...sampleDbItem,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

type FakeDatabaseOptions = {
  selectedItems?: unknown[];
  count?: number;
  insertedItems?: unknown[];
  insertError?: Error;
};

type SelectChain = PromiseLike<unknown[]> & {
  from: () => SelectChain;
  where: () => SelectChain;
  orderBy: () => SelectChain;
  limit: () => SelectChain;
  offset: () => Promise<unknown[]>;
};

type InsertChain = {
  values: () => InsertChain;
  returning: () => Promise<unknown[]>;
};

const createFakeDatabase = (options: FakeDatabaseOptions = {}) => {
  const selectedItems = options.selectedItems ?? [sampleDbItem];
  const count = options.count ?? selectedItems.length;
  const insertedItems = options.insertedItems ?? [sampleDbItem];

  const makeSelectChain = (result: unknown[]) => {
    const chain: SelectChain = {
      from: () => chain,
      where: () => chain,
      orderBy: () => chain,
      limit: () => chain,
      offset: () => Promise.resolve(result),
      then: (resolve: (value: unknown[]) => unknown, reject: (reason?: unknown) => unknown) =>
        Promise.resolve(result).then(resolve, reject),
    };

    return chain;
  };

  const insertChain: InsertChain = {
    values: () => insertChain,
    returning: () => {
      if (options.insertError) {
        return Promise.reject(options.insertError);
      }

      return Promise.resolve(insertedItems);
    },
  };

  return {
    select: (selection?: unknown) => {
      if (selection) {
        return makeSelectChain([{ count }]);
      }

      return makeSelectChain(selectedItems);
    },
    insert: () => insertChain,
  };
};

const createApp = async (database = createFakeDatabase()) => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DB)
    .useValue(database)
    .compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({ logger: false }),
  );
  await app.init();

  return app;
};

describe("Warehouse API (e2e)", () => {
  let app: NestFastifyApplication;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("/api/v1/health (GET)", async () => {
    app = await createApp();

    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({ method: "GET", url: "/api/v1/health" });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      status: "ok",
      service: "warehouse-backend",
    });
  });

  it("/api/v1/items/search (POST)", async () => {
    app = await createApp();

    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({
      method: "POST",
      url: "/api/v1/items/search",
      payload: {
        query: "tote",
        page: 1,
        limit: 20,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      data: [sampleApiItem],
      __meta__: {
        count: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });
  });

  it("/api/v1/items/search (POST) validates request body", async () => {
    app = await createApp();

    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({
      method: "POST",
      url: "/api/v1/items/search",
      payload: {
        limit: 101,
      },
    });

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.payload)).toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("/api/v1/items/:sku (GET)", async () => {
    app = await createApp();

    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({ method: "GET", url: "/api/v1/items/SKU-001" });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      data: sampleApiItem,
    });
  });

  it("/api/v1/items/:sku (GET) returns 404 when missing", async () => {
    app = await createApp(createFakeDatabase({ selectedItems: [] }));

    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({ method: "GET", url: "/api/v1/items/MISSING" });

    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.payload)).toMatchObject({
      code: "ITEM_NOT_FOUND",
    });
  });

  it("/api/v1/items (POST)", async () => {
    app = await createApp();

    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({
      method: "POST",
      url: "/api/v1/items",
      payload: {
        sku: "SKU-001",
        name: "Warehouse Tote",
        unitPrice: "199.00",
      },
    });

    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.payload)).toEqual({
      data: sampleApiItem,
    });
  });

  it("/api/v1/items (POST) returns 409 for duplicate SKU", async () => {
    app = await createApp(
      createFakeDatabase({
        insertError: Object.assign(new Error("duplicate"), { code: "23505" }),
      }),
    );

    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({
      method: "POST",
      url: "/api/v1/items",
      payload: {
        sku: "SKU-001",
        name: "Warehouse Tote",
      },
    });

    expect(res.statusCode).toBe(409);
    expect(JSON.parse(res.payload)).toMatchObject({
      code: "DUPLICATE_ITEM_ERROR",
    });
  });

  it("/api/v1/auth/login (POST) is not registered", async () => {
    app = await createApp();

    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({ method: "POST", url: "/api/v1/auth/login" });

    expect(res.statusCode).toBe(404);
  });
});
