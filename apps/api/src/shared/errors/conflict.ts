import { AppError, type ErrorCode } from './app.ts';

export class ConflictError extends AppError {
  constructor(options?: { message?: string; code?: ErrorCode; details?: unknown }) {
    super({
      code: options?.code ?? 'RESOURCE_CONFLICT',
      statusCode: 409,
      message: options?.message ?? 'Resource already exists',
      details: options?.details,
    });
    this.name = 'ConflictError';
  }
}


