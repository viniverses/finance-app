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
          throw new UnauthorizedError({ message: 'Invalid token', code: 'INVALID_TOKEN' });
        }

        return payload;
      }

      throw new UnauthorizedError({
        message: 'Token not found',
        code: 'TOKEN_NOT_FOUND',
        details: 'Expected "Bearer <token>" in Authorization header',
      });
    },
    signIn: async (user: { id: string; name: string; email: string }) => {
      const accessToken = await jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email,
      });

      const expiresIn = 7 * 24 * 60 * 60; // 7 dias
      const exp = Math.floor(Date.now() / 1000) + expiresIn;

      const refreshToken = await jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email,
        exp,
      });

      return {
        accessToken,
        refreshToken,
      };
    },
  }))
  .as('global');

