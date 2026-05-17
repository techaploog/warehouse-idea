import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    await app.init();
  });

  it("/api/health (GET)", async () => {
    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({ method: "GET", url: "/api/health" });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      status: "ok",
      service: "warehouse-backend",
    });
  });

  it("/api/v1/items (GET)", async () => {
    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({ method: "GET", url: "/api/v1/items" });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      items: [
        { id: "item-1", name: "Sample Item" },
        { id: "item-2", name: "Warehouse Tote" },
      ],
    });
  });

  it("/api/v1/auth/login (POST) is not registered", async () => {
    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({ method: "POST", url: "/api/v1/auth/login" });

    expect(res.statusCode).toBe(404);
  });

  it("/api/v1 (GET) is not registered", async () => {
    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({ method: "GET", url: "/api/v1" });

    expect(res.statusCode).toBe(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
