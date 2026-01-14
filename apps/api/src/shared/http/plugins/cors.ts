import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';

export const corsPlugin = new Elysia({ name: 'cors' }).use(
  cors({
    credentials: true,
    allowedHeaders: ['content-type', 'authorization', 'cookie'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    origin: (request): boolean => {
      const origin = request.headers.get('origin');

      if (!origin) {
        return false;
      }

      return true;
    },
  })
);


