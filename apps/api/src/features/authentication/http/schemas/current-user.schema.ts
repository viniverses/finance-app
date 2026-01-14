import { t } from 'elysia';

export const MeResponseSchema = t.Object(
  {
    email: t.String({
      examples: ['user@example.com'],
    }),
    name: t.String({
      examples: ['John Doe'],
    }),
    telegramId: t.Nullable(
      t.String({
        examples: ['1234567890'],
      })
    ),
    allowed: t.Boolean({
      examples: [true],
    }),
    createdAt: t.Nullable(
      t.String({
        format: 'date-time',
        examples: ['2024-01-01T00:00:00.000Z'],
      })
    ),
    updatedAt: t.Nullable(
      t.String({
        format: 'date-time',
        examples: ['2024-01-01T00:00:00.000Z'],
      })
    ),
  },
  {
    description: 'User profile information',
  }
);
