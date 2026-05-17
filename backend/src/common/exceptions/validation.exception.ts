import { HttpExceptionOptions, HttpStatus } from "@nestjs/common";
import { ServiceException } from "./service.exception";

export class ValidationException extends ServiceException {
  constructor(message: string, options?: HttpExceptionOptions) {
    super("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST, options);
  }
}
