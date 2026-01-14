import { Elysia, t } from 'elysia';

import { authenticationPrivateRoutes } from '@/features/authentication/http/routes.ts';

const bearerTokenOpenApi = {
  headers: t.Object({
    authorization: t.String({
      type: 'Authorization',
      description: 'Token',
      examples: ['Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'],
    }),
  }),
  detail: {
    security: [{ bearerAuth: [''] }],
  },
};

const privateRoutesApp = new Elysia().guard(bearerTokenOpenApi);

privateRoutesApp.use(authenticationPrivateRoutes);

export const privateRoutes = privateRoutesApp;
