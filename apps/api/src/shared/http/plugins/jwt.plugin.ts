import { jwt } from '@elysiajs/jwt';
import { Elysia, t } from 'elysia';

import { env } from '@/env';

const jwtPayloadSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String(),
  email: t.String(),
});

export type JWTPayload = typeof jwtPayloadSchema.static;

export const jwtPlugin = new Elysia({ name: 'jwt' }).use(
  jwt({
    name: 'jwt',
    secret: env.JWT_SECRET,
    schema: jwtPayloadSchema,
  })
);
