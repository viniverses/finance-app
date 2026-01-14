import { AppError, type ErrorCode } from './app.ts';

export class BadRequestError extends AppError {
  constructor(options?: { message?: string; code?: ErrorCode; details?: unknown }) {
    super({
      code: options?.code ?? 'BAD_REQUEST',
      statusCode: 400,
      message: options?.message ?? 'Invalid request',
      details: options?.details,
    });
    this.name = 'BadRequestError';
  }
}


