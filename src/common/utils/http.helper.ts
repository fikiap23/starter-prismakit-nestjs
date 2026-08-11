import { Request, Response } from 'express';
import { cacheDebugStorage, isCacheDebugEnabled } from '@prismakit/core';
import {
  IFormatResponse,
  IFormatErrorResponse,
  IResponseMeta,
  IErrorDetail,
} from 'src/shared/interfaces/http-helper.interface';

function applyCacheDebugHeader(response: Response): void {
  if (!isCacheDebugEnabled()) return;
  const status = cacheDebugStorage.getStore()?.status ?? 'SKIP';
  response.setHeader('X-Cache', status);
}

function getRequestId(response: Response): string {
  return (response.req as Request)?.requestId ?? '';
}

export const formatResponse = (
  response: Response,
  status: number,
  data: unknown,
  paginationMeta?: Record<string, unknown>,
): Response => {
  const meta: IResponseMeta = {
    requestId: getRequestId(response),
    serverTime: new Date().toISOString(),
  };

  if (paginationMeta) {
    if (paginationMeta.page !== undefined)
      meta.page = paginationMeta.page as number;
    if (paginationMeta.pageSize !== undefined)
      meta.pageSize = paginationMeta.pageSize as number;
    if (paginationMeta.totalItems !== undefined)
      meta.totalItems = paginationMeta.totalItems as number;
    if (paginationMeta.totalPages !== undefined)
      meta.totalPages = paginationMeta.totalPages as number;
    if (paginationMeta.sort !== undefined)
      meta.sort = paginationMeta.sort as string;
  }

  const body: IFormatResponse = { data, meta };
  applyCacheDebugHeader(response);
  return response.status(status).send(body);
};

export const formatErrorResponse = (
  response: Response,
  message: string,
  statusCode: number,
  code?: string,
  details?: IErrorDetail[],
): Response => {
  const body: IFormatErrorResponse = {
    error: {
      code: code ?? 'INTERNAL_ERROR',
      message,
      httpStatus: statusCode,
      ...(details && details.length > 0 ? { details } : {}),
      requestId: getRequestId(response),
      occurredAt: new Date().toISOString(),
    },
  };
  return response.status(statusCode).send(body);
};
