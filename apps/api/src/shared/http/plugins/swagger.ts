import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';

import { env } from '@/env';

export const swaggerPlugin = new Elysia({ name: 'swagger' }).use(
  swagger({
    path: env.API_DOCS_PATH,
    documentation: {
      info: {
        title: 'Agora Vai API',
        version: env.API_VERSION,
        description: 'Financial management API',
      },
      components: {
        headers: {
          Authorization: {
            description: 'Enter JWT token obtained from /auth/login endpoint',
            required: true,
            schema: {
              type: 'string',
            },
            example: 'Bearer <token>',
          },
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT token obtained from /auth/login endpoint',
          },
        },
      },
    },
  })
);


