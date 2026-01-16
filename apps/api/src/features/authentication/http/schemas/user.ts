import { t } from 'elysia';

export const UserResponseSchema = t.Object(
  {
    id: t.String({
      format: 'uuid',
      examples: ['123e4567-e89b-12d3-a456-426614174000'],
    }),
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
    createdAt: t.String({
      format: 'date-time',
      examples: ['2024-01-01T00:00:00.000Z'],
    }),
    updatedAt: t.Nullable(
      t.String({
        format: 'date-time',
        examples: ['2024-01-01T00:00:00.000Z'],
      })
    ),
  },
  {
    description: 'User information',
  }
);

export type UserResponseDTO = typeof UserResponseSchema.static;
