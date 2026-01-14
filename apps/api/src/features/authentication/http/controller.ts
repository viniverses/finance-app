import { Elysia } from 'elysia';

import type { AuthenticateUseCase } from '@/features/authentication/application/use-cases/authenticate.ts';
import {
  authenticateOpenApi,
  getProfileOpenApi,
  registerOpenApi,
  updateUserOpenApi,
} from '@/features/authentication/http/openapi/index.ts';
import type { JwtTokens } from '@/features/authentication/services/jwt.ts';
import { GetUserProfileUseCase } from '@/features/authentication/application/use-cases/get-user-profile.ts';
import { RegisterUseCase } from '@/features/authentication/application/use-cases/register.ts';
import { UpdateUserUseCase } from '@/features/authentication/application/use-cases/update-user.ts';
import { authPlugin } from '@/shared/http/plugins/auth.ts';
import { httpPlugin } from '@/shared/http/plugins/http.ts';

type SignInFunction = (user: {
  id: string;
  name: string;
  email: string;
}) => Promise<JwtTokens>;

export type AuthenticateControllerDependencies = {
  registerUseCase: RegisterUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
  updateUserUseCase: UpdateUserUseCase;
  createAuthenticateUseCase: (signIn: SignInFunction) => AuthenticateUseCase;
};

export class AuthenticateController {
  constructor(
    private readonly dependencies: AuthenticateControllerDependencies
  ) {}

  public setupPublicRoutes() {
    return new Elysia()
      .use(httpPlugin)
      .use(authPlugin)
      .post(
        '/authenticate',
        async ({ body, signIn, set }) => {
          const authenticateUseCase =
            this.dependencies.createAuthenticateUseCase(signIn);

          const tokens = await authenticateUseCase.execute({
            email: body.email,
            password: body.password,
          });

          set.status = 200;
          return tokens;
        },
        authenticateOpenApi
      )
      .post(
        '/register',
        async ({ body, set }) => {
          await this.dependencies.registerUseCase.execute({
            email: body.email,
            name: body.name,
            password: body.password,
          });

          set.status = 201;
        },
        registerOpenApi
      );
  }

  public setupPrivateRoutes() {
    return new Elysia()
      .use(httpPlugin)
      .use(authPlugin)
      .get(
        '/me',
        async ({ getCurrentUser }) => {
          const currentUser = await getCurrentUser();

          const user = await this.dependencies.getUserProfileUseCase.execute({
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
          const updatedUser = await this.dependencies.updateUserUseCase.execute(
            {
              id: params.id,
              name: body.name,
              email: body.email,
              telegramId: body.telegramId,
            }
          );

          return {
            ...updatedUser,
            allowed: updatedUser.allowed ?? false,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt?.toISOString() ?? null,
          };
        },
        updateUserOpenApi
      );
  }
}
