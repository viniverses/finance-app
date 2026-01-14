import { t } from 'elysia';

export const UpdateUserRequestSchema = t.Object(
  {
    name: t.Optional(
      t.String({
        minLength: 3,
        examples: ['John Doe'],
      })
    ),
    email: t.Optional(
      t.String({
        format: 'email',
        examples: ['user@example.com'],
      })
    ),
    telegramId: t.Optional(
      t.Nullable(
        t.String({
          examples: ['1234567890'],
        })
      )
    ),
  },
  {
    minProperties: 1,
    additionalProperties: false,
    errorMessage: {
      minProperties: 'At least one property is required to update user',
    },
  }
);

export const UpdateUserResponseSchema = t.Object(
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
    description: 'Updated user',
  }
);


