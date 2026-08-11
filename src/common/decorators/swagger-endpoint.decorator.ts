import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

type SwaggerEndpointOptions = {
  summary: string;
  description?: string;
  auth?: boolean;
  success?: { status?: number; description?: string };
  body?: unknown;
  params?: Array<{ name: string; description?: string }>;
  pagination?: boolean;
};

export const SwaggerEndpoint = ({
  summary,
  description,
  auth = true,
  success = { status: 200, description: 'Success' },
  body,
  params = [],
  pagination = false,
}: SwaggerEndpointOptions) => {
  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [
    ApiOperation({ summary, ...(description ? { description } : {}) }),
    ApiResponse({
      status: success.status ?? 200,
      description: success.description ?? 'Success',
    }),
  ];

  if (auth) decorators.push(ApiBearerAuth());
  if (body) decorators.push(ApiBody({ type: body as never }));
  params.forEach((p) =>
    decorators.push(
      ApiParam({ name: p.name, required: true, description: p.description }),
    ),
  );
  if (pagination) {
    decorators.push(
      ApiQuery({ name: 'page', required: false, example: 1 }),
      ApiQuery({ name: 'pageSize', required: false, example: 25 }),
      ApiQuery({ name: 'sort', required: false, example: '-createdAt' }),
      ApiQuery({ name: 'q', required: false }),
    );
  }
  return applyDecorators(...decorators);
};
