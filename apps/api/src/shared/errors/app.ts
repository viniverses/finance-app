export type ErrorCode = string;

export type AppErrorOptions = {
  code: string;
  statusCode: number;
  message: string;
  details?: unknown;
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
  }
}


