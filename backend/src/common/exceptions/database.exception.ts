import { HttpExceptionOptions, HttpStatus } from "@nestjs/common";
import { ServiceException } from "./service.exception";

export class DatabaseException extends ServiceException {
  constructor(message: string, options?: HttpExceptionOptions) {
    super("DATABASE_ERROR", message, HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}
