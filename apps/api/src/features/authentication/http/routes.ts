import { Elysia } from 'elysia';

import type { JwtTokens } from '../services/jwt.ts';
import { AuthenticateUseCase } from '../application/use-cases/authenticate.ts';
import { GetUserProfileUseCase } from '../application/use-cases/get-user-profile.ts';
import { RegisterUseCase } from '../application/use-cases/register.ts';
import { UpdateUserUseCase } from '../application/use-cases/update-user.ts';
import { BcryptHasherService } from '../infrastructure/bcrypt.ts';
import { DrizzleUserRepository } from '../infrastructure/drizzle-user-repository.ts';
import { ElysiaJwtService } from '../infrastructure/elysia-jwt.ts';
import { AuthenticateController } from './controller.ts';

type SignInFunction = (user: {
  id: string;
  name: string;
  email: string;
}) => Promise<JwtTokens>;

const userRepository = new DrizzleUserRepository();
const passwordHashService = new BcryptHasherService();
const registerUseCase = new RegisterUseCase(
  userRepository,
  passwordHashService
);
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);

const createAuthenticateUseCase = (signIn: SignInFunction) => {
  const jwtService = new ElysiaJwtService(signIn);
  return new AuthenticateUseCase(
    userRepository,
    passwordHashService,
    jwtService
  );
};

const authenticateController = new AuthenticateController({
  registerUseCase,
  getUserProfileUseCase,
  updateUserUseCase,
  createAuthenticateUseCase,
});

const authenticationPublicRoutes = new Elysia().group('/auth', (app) => {
  app.use(authenticateController.setupPublicRoutes());

  return app;
});

const authenticationPrivateRoutes = new Elysia().group('/auth', (app) => {
  app.use(authenticateController.setupPrivateRoutes());

  return app;
});

export { authenticationPublicRoutes, authenticationPrivateRoutes };
