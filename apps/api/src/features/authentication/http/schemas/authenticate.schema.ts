import { t } from 'elysia';

export const AuthenticateRequestSchema = t.Object({
  email: t.String({
    minLength: 1,
    format: 'email',
    examples: ['user@example.com'],
  }),
  password: t.String({
    minLength: 1,
    examples: ['password123'],
  }),
});

export const AuthenticateResponseSchema = t.Object(
  {
    accessToken: t.String({
      examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'],
    }),
    refreshToken: t.String({
      examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'],
    }),
  },
  {
    description: 'Access and refresh tokens',
  }
);
