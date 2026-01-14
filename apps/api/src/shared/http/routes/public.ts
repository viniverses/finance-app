import { Elysia } from 'elysia';

import { authenticationPublicRoutes } from '@/features/authentication/http/routes.ts';

const publicRoutesApp = new Elysia();

publicRoutesApp.use(authenticationPublicRoutes);

export const publicRoutes = publicRoutesApp;
