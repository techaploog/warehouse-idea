import db, { TDatabase } from "@/database";
import { Global, Module } from "@nestjs/common";
import { DB } from "./database.constants";

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useValue: db satisfies TDatabase,
    },
  ],
  exports: [DB],
})
export class DatabaseModule {}
