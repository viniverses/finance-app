import { t } from 'elysia';

export const authenticateOpenApi = {
  body: t.Object({
    email: t.String({
      minLength: 1,
      format: 'email',
      examples: ['user@example.com'],
    }),
    password: t.String({
      minLength: 1,
      examples: ['password123'],
    }),
  }),
  response: {
    200: t.Object({
      accessToken: t.String({
        examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'],
      }),
      refreshToken: t.String({
        examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'],
      }),
    }),
  },
  detail: {
    tags: ['Authentication'],
    summary: 'Authenticate',
    description: 'Authenticates with email and password',
    operationId: 'authenticate',
  },
};

