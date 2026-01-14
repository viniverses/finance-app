import { randomUUID } from 'node:crypto';

import { Elysia } from 'elysia';

import { AppError } from '@/shared/errors/app.ts';
import { InternalError } from '@/shared/errors/internal.ts';
import {
  ErrorResponseModel,
  errorResponses,
} from '@/shared/http/models/errors.ts';

export const httpPlugin = new Elysia({ name: 'http' })
  .derive(({ request, set }) => {
    const requestId = request.headers.get('x-request-id') ?? randomUUID();

    set.headers['x-request-id'] = requestId;

    return { requestId };
  })
  .onError(({ error, set, code, requestId }) => {
    const timestamp = new Date().toISOString();

    const meta = {
      requestId: requestId ?? '',
      timestamp,
    };

    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false as const,
        error: error,
        meta,
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false as const,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Route not found',
        },
        meta,
      };
    }

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false as const,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Validation error',
          details: error,
        },
        meta,
      };
    }

    const internal = new InternalError();
    set.status = internal.statusCode;
    return {
      success: false as const,
      error: {
        code: internal.code ?? 'INTERNAL_SERVER_ERROR',
        message: internal.message ?? 'An unexpected error occurred',
        details: internal.details ?? null,
      },
      meta,
    };
  })
  .model({
    ErrorResponseModel,
  })
  .as('global');

export { errorResponses };
