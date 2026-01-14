import { AppError, type ErrorCode } from './app.ts';

export class RepositoryError extends AppError {
  public readonly operation: string;
  public readonly tableName: string;
  public readonly originalError?: unknown;

  constructor(operation: string, tableName: string, originalError?: unknown) {
    super({
      code: 'REPOSITORY_ERROR' as ErrorCode,
      statusCode: 500,
      message: `Failed to ${operation} ${tableName}`,
      details: originalError,
    });
    this.name = 'RepositoryError';
    this.operation = operation;
    this.tableName = tableName;
    this.originalError = originalError;
  }
}


