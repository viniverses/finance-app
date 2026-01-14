import { t } from 'elysia';

const ErrorModel = t.Object({
  code: t.String({
    description: 'The error code',
    examples: [
      'BAD_REQUEST',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'TOO_MANY_REQUESTS',
      'INTERNAL_SERVER_ERROR',
    ],
  }),
  message: t.String({ description: 'The error message' }),
  details: t.Optional(t.Unknown()),
});

const MetaModel = t.Object({
  requestId: t.String({
    description: 'The request ID',
    examples: ['123e4567-e89b-12d3-a456-426614174000'],
  }),
  timestamp: t.String({
    description: 'The timestamp',
    examples: ['2026-01-14T12:00:00.000Z'],
  }),
});

export const ErrorResponseModel = t.Object({
  success: t.Literal(false),
  error: ErrorModel,
  meta: MetaModel,
});

export const createErrorResponseModel = (description?: string) =>
  t.Object(
    {
      success: t.Literal(false),
      error: ErrorModel,
      meta: MetaModel,
    },
    description ? { description } : undefined
  );

export const errorResponses = {
  400: createErrorResponseModel('Bad Request'),
  401: createErrorResponseModel('Unauthorized'),
  403: createErrorResponseModel('Forbidden'),
  404: createErrorResponseModel('Not Found'),
  429: createErrorResponseModel('Too Many Requests'),
  500: createErrorResponseModel('Internal Server Error'),
};


