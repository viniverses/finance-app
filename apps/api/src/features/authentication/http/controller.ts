import { Elysia } from 'elysia';

import { AuthenticateUseCase } from '@/features/authentication/application/use-cases/authenticate.ts';
import {
  authenticateOpenApi,
  getProfileOpenApi,
  registerOpenApi,
  updateUserOpenApi,
} from '@/features/authentication/http/openapi/index.ts';
import { GetUserProfileUseCase } from '@/features/authentication/application/use-cases/get-user-profile.ts';
import { RegisterUseCase } from '@/features/authentication/application/use-cases/register.ts';
import { UpdateUserUseCase } from '@/features/authentication/application/use-cases/update-user.ts';
import { ElysiaJwtService } from '@/features/authentication/infrastructure/elysia-jwt.ts';
import { UserMapper } from '@/features/authentication/http/mappers/users.ts';
import { authPlugin } from '@/shared/http/plugins/auth.ts';
import { httpPlugin } from '@/shared/http/plugins/http.ts';
import { UserRepository } from '../repositories/user.ts';
import { PasswordHasherService } from '../services/password-hasher.ts';

export type AuthenticateControllerDependencies = {
  registerUseCase: RegisterUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
  updateUserUseCase: UpdateUserUseCase;
  userRepository: UserRepository;
  passwordHashService: PasswordHasherService;
};

export class AuthenticateController {
  private readonly userMapper = new UserMapper();

  constructor(
    private readonly dependencies: AuthenticateControllerDependencies
  ) {}

  public setupPublicRoutes() {
    return new Elysia()
      .use(httpPlugin)
      .use(authPlugin)
      .post(
        '/authenticate',
        async ({ body, jwt, set }) => {
          const jwtService = new ElysiaJwtService(jwt);
          const authenticateUseCase = new AuthenticateUseCase(
            this.dependencies.userRepository,
            this.dependencies.passwordHashService,
            jwtService
          );

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
          await this.dependencies.registerUseCase.execute(body);

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

          return this.userMapper.toDTO(user);
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

          return this.userMapper.toDTO(updatedUser);
        },
        updateUserOpenApi
      );
  }
}
