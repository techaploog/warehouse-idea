import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export abstract class AbstractService<T, R> {
  protected readonly logger = new Logger(this.constructor.name);

  abstract execute(data: T): Promise<R>;
}
