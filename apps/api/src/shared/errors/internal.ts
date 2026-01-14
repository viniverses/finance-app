import { AppError, type ErrorCode } from './app.ts';

export class InternalError extends AppError {
  constructor(options?: {
    message?: string;
    code?: ErrorCode;
    details?: unknown;
  }) {
    super({
      code: options?.code ?? 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
      message: options?.message ?? 'Internal server error',
      details: options?.details,
    });
    this.name = 'InternalError';
  }
}

