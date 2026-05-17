export const APP_CONFIG = {
  port: process.env.PORT || 3300,
  host: process.env.HOST || "0.0.0.0",
  apiPrefix: process.env.API_PREFIX || "/api",
  dbUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/warehouse",
};
