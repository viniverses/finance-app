import { Elysia } from 'elysia';

import { UnauthorizedError } from '@/shared/errors/unauthorized.ts';
import { JWTPayload, jwtPlugin } from './jwt.ts';

export const authPlugin = new Elysia({ name: 'auth' })
  .use(jwtPlugin)
  .derive(async ({ jwt, headers }) => ({
    getCurrentUser: async (): Promise<JWTPayload> => {
      const token = headers.authorization;

      if (token?.startsWith('Bearer ')) {
        const payload = await jwt.verify(token.substring(7));

        if (!payload) {
          throw new UnauthorizedError({
            message: 'Invalid token',
            code: 'INVALID_TOKEN',
          });
        }

        return payload;
      }

      throw new UnauthorizedError({
        message: 'Token not found',
        code: 'TOKEN_NOT_FOUND',
        details: 'Expected "Bearer <token>" in Authorization header',
      });
    },
  }))
  .as('global');
