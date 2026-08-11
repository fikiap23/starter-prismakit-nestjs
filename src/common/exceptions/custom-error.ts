export class CustomError extends Error {
  statusCode: number;
  code?: string;
  details?: Array<{
    field?: string;
    code?: string;
    message: string;
    meta?: Record<string, unknown>;
  }>;

  constructor({
    message,
    statusCode,
    code,
    details,
  }: {
    message: string;
    statusCode: number;
    code?: string;
    details?: Array<{
      field?: string;
      code?: string;
      message: string;
      meta?: Record<string, unknown>;
    }>;
  }) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
