import { t } from 'elysia';

const ErrorModel = t.Object({
  code: t.String(),
  message: t.String(),
  details: t.Optional(t.Unknown()),
});

const MetaModel = t.Object({
  requestId: t.String(),
  timestamp: t.String(),
});

export const ErrorResponseModel = t.Object({
  success: t.Literal(false),
  error: ErrorModel,
  meta: MetaModel,
});

export const ErrorEnvelopeModel = (description?: string) =>
  t.Object(
    {
      success: t.Literal(false),
      error: ErrorModel,
      meta: MetaModel,
    },
    description ? { description } : undefined
  );

export const errorResponses = {
  400: ErrorEnvelopeModel('Bad Request'),
  401: ErrorEnvelopeModel('Unauthorized'),
  403: ErrorEnvelopeModel('Forbidden'),
  404: ErrorEnvelopeModel('Not Found'),
  429: ErrorEnvelopeModel('Too Many Requests'),
  500: ErrorEnvelopeModel('Internal Server Error'),
};
