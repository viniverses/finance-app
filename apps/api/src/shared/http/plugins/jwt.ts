import { jwt } from '@elysiajs/jwt';
import { Elysia, t } from 'elysia';

import { env } from '@/env';

const jwtPayloadSchema = t.Object(
  {
    id: t.String({ format: 'uuid' }),
    name: t.String(),
    email: t.String(),
    exp: t.Optional(t.Number()),
  },
  {
    description: 'JWT payload',
    examples: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@example.com',
        exp: 1715808000,
      },
    ],
  }
);

export type JWTPayload = typeof jwtPayloadSchema.static;

export const jwtPlugin = new Elysia({ name: 'jwt' }).use(
  jwt({
    name: 'jwt',
    secret: env.JWT_SECRET,
    schema: jwtPayloadSchema,
  })
);
