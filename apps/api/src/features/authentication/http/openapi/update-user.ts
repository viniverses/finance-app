import { t } from 'elysia';

import {
  UpdateUserRequestSchema,
  UpdateUserResponseSchema,
} from '../schemas/update-user.ts';

export const updateUserOpenApi = {
  params: t.Object({
    id: t.String({
      format: 'uuid',
      examples: ['123e4567-e89b-12d3-a456-426614174000'],
    }),
  }),
  body: UpdateUserRequestSchema,
  response: {
    200: UpdateUserResponseSchema,
  },
  detail: {
    tags: ['Authentication'],
    summary: 'Update user',
    description: 'Updates user information',
    operationId: 'updateUser',
    security: [{ bearerAuth: [] }],
  },
};


