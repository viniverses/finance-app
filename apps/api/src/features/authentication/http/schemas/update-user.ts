import { t } from 'elysia';

import { UserResponseSchema } from './user.ts';

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

export const UpdateUserResponseSchema = UserResponseSchema;
