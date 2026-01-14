import { AppError, type ErrorCode } from './app.ts';

export class UnauthorizedError extends AppError {
  constructor(options?: { message?: string; code?: ErrorCode; details?: unknown }) {
    super({
      code: options?.code ?? 'UNAUTHORIZED',
      statusCode: 401,
      message: options?.message ?? 'Unauthorized',
      details: options?.details,
    });
    this.name = 'UnauthorizedError';
  }
}


