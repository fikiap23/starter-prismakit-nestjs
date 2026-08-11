export interface IResponseMeta {
  requestId: string;
  serverTime: string;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  sort?: string;
}

export interface IFormatResponse {
  data: unknown;
  meta: IResponseMeta;
}

export interface IErrorDetail {
  field?: string;
  code?: string;
  message: string;
  meta?: Record<string, unknown>;
}

export interface IErrorBody {
  code: string;
  message: string;
  httpStatus: number;
  details?: IErrorDetail[];
  requestId: string;
  occurredAt: string;
}

export interface IFormatErrorResponse {
  error: IErrorBody;
}
