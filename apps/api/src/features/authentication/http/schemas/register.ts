import { t } from 'elysia';

export const RegisterRequestSchema = t.Object({
  email: t.String({
    format: 'email',
    examples: ['user@example.com'],
  }),
  name: t.String({
    minLength: 3,
    examples: ['John Doe'],
  }),
  password: t.String({
    minLength: 8,
    examples: ['password123'],
    description: 'Password must be at least 8 characters',
  }),
});

export const RegisterResponseSchema = t.Undefined({
  description: 'User created successfully',
});


