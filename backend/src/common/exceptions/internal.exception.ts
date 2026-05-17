import { HttpExceptionOptions, HttpStatus } from "@nestjs/common";
import { ServiceException } from "./service.exception";

export class InternalException extends ServiceException {
  constructor(message: string, options?: HttpExceptionOptions) {
    super("INTERNAL_SERVER_ERROR", message, HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}
