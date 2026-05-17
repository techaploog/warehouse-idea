import { ServiceException } from "@/common/exceptions/service.exception";
import { HttpExceptionOptions, HttpStatus } from "@nestjs/common";

export class ItemNotFoundException extends ServiceException {
  constructor(message: string, options?: HttpExceptionOptions) {
    super("ITEM_NOT_FOUND", message, HttpStatus.NOT_FOUND, options);
  }
}
