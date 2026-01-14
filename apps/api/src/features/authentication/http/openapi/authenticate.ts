import {
  AuthenticateRequestSchema,
  AuthenticateResponseSchema,
} from '../schemas/authenticate.ts';

export const authenticateOpenApi = {
  body: AuthenticateRequestSchema,
  response: {
    200: AuthenticateResponseSchema,
  },
  detail: {
    tags: ['Authentication'],
    summary: 'Authenticate',
    description: 'Authenticates with email and password',
    operationId: 'authenticate',
  },
};


