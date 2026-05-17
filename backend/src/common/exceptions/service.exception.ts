import { HttpException, HttpExceptionOptions, HttpStatus } from "@nestjs/common";

export type TServiceExceptionCode = string;

export abstract class ServiceException extends HttpException {
  code: TServiceExceptionCode;

  constructor(
    code: TServiceExceptionCode,
    message: string,
    status: HttpStatus,
    options?: HttpExceptionOptions,
  ) {
    super(
      {
        statusCode: status,
        code,
        message,
      },
      status,
      options,
    );
    this.code = code;
  }
}
