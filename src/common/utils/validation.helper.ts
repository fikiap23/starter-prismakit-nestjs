import { Response } from 'express';
import { formatErrorResponse } from './http.helper';
import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { EErrorCode } from 'src/common/enums/error.enum';
import { CustomError } from 'src/common/exceptions/custom-error';
import { IErrorDetail } from 'src/shared/interfaces/http-helper.interface';

const PRISMA_ERROR_MAP: Record<
  string,
  { status: number; code: string; message: string }
> = {
  P2002: {
    status: 409,
    code: EErrorCode.DUPLICATE_RESOURCE,
    message: 'Resource already exists',
  },
  P2025: {
    status: 404,
    code: EErrorCode.RESOURCE_NOT_FOUND,
    message: 'Resource not found',
  },
};

type HttpLikeError = {
  statusCode: number;
  message: string;
  code?: string;
  details?: IErrorDetail[];
};

function isHttpLikeError(value: unknown): value is HttpLikeError {
  return (
    !!value &&
    typeof value === 'object' &&
    'statusCode' in value &&
    'message' in value
  );
}

export const errorHandler = (response: Response, error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_MAP[error.code] ?? {
      status: 400,
      code: EErrorCode.INTERNAL_ERROR,
      message: 'Database request failed',
    };
    return formatErrorResponse(
      response,
      mapped.message,
      mapped.status,
      mapped.code,
    );
  }

  if (error instanceof CustomError) {
    return formatErrorResponse(
      response,
      error.message,
      error.statusCode,
      error.code,
      error.details,
    );
  }

  if (isHttpLikeError(error)) {
    return formatErrorResponse(
      response,
      error.message,
      error.statusCode,
      error.code,
      error.details,
    );
  }

  console.error(error);
  return formatErrorResponse(
    response,
    'Internal server error',
    500,
    EErrorCode.INTERNAL_ERROR,
  );
};
