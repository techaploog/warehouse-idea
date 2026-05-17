import { ServiceException } from "@/common/exceptions/service.exception";
import { HttpExceptionOptions, HttpStatus } from "@nestjs/common";

export class DuplicateItemException extends ServiceException {
  constructor(message: string, options?: HttpExceptionOptions) {
    super("DUPLICATE_ITEM_ERROR", message, HttpStatus.CONFLICT, options);
  }
}
