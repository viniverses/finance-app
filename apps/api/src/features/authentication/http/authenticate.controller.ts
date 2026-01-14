import { Elysia } from 'elysia';

import { AuthenticateUseCase } from '@/features/authentication/application/use-cases/authenticate.use-case.ts';
import { GetUserProfileUseCase } from '@/features/authentication/application/use-cases/get-user-profile.use-case.ts';
import { RegisterUseCase } from '@/features/authentication/application/use-cases/register.use-case.ts';
import { UpdateUserUseCase } from '@/features/authentication/application/use-cases/update-user.use-case.ts';
import {
  authenticateOpenApi,
  getProfileOpenApi,
  registerOpenApi,
  updateUserOpenApi,
} from '@/features/authentication/http/openapi/index.ts';
import { authPlugin } from '@/shared/http/plugins/auth.plugin.ts';
import { httpPlugin } from '@/shared/http/plugins/http.plugin.ts';

type AuthenticationUseCases = {
  authenticateUseCase: AuthenticateUseCase;
  registerUseCase: RegisterUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
  updateUserUseCase: UpdateUserUseCase;
};

export const authenticateController = (useCases: AuthenticationUseCases) => {
  const { authenticateUseCase, registerUseCase, getUserProfileUseCase, updateUserUseCase } =
    useCases;

  return new Elysia({ name: 'authentication-controller' })
    .use(httpPlugin)
    .use(authPlugin)
    .post(
      '/authenticate',
      async ({ body, signIn, set }) => {
        const result = await authenticateUseCase.execute({
          email: body.email,
          password: body.password,
        });

        const tokens = await signIn({
          id: result.id,
          name: result.name,
          email: result.email,
        });

        set.status = 200;
        return tokens;
      },
      authenticateOpenApi
    )
    .post(
      '/register',
      async ({ body, set }) => {
        await registerUseCase.execute({
          email: body.email,
          name: body.name,
          password: body.password,
        });

        set.status = 201;
      },
      registerOpenApi
    )
    .get(
      '/me',
      async ({ getCurrentUser }) => {
        const currentUser = await getCurrentUser();

        const user = await getUserProfileUseCase.execute({
          id: currentUser.id,
        });

        return {
          ...user,
          allowed: user.allowed ?? false,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt?.toISOString() ?? null,
        };
      },
      getProfileOpenApi
    )
    .put(
      '/users/:id',
      async ({ params, body }) => {
        const updatedUser = await updateUserUseCase.execute({
          id: params.id,
          name: body.name,
          email: body.email,
          telegramId: body.telegramId,
        });

        return {
          ...updatedUser,
          allowed: updatedUser.allowed ?? false,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt?.toISOString() ?? null,
        };
      },
      updateUserOpenApi
    );
};
