import { AppError, type ErrorCode } from './app.ts';

export class NotFoundError extends AppError {
  constructor(options?: {
    message?: string;
    code?: ErrorCode;
    details?: unknown;
  }) {
    super({
      code: options?.code ?? 'RESOURCE_NOT_FOUND',
      statusCode: 404,
      message: options?.message ?? 'Not found',
      details: options?.details,
    });
    this.name = 'NotFoundError';
  }
}

