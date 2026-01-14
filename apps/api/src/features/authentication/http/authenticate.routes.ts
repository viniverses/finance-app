import { Elysia } from 'elysia';

import { AuthenticateUseCase } from '@/features/authentication/application/use-cases/authenticate.use-case.ts';
import { GetUserProfileUseCase } from '@/features/authentication/application/use-cases/get-user-profile.use-case.ts';
import { RegisterUseCase } from '@/features/authentication/application/use-cases/register.use-case.ts';
import { UpdateUserUseCase } from '@/features/authentication/application/use-cases/update-user.use-case.ts';
import { BcryptHasherService } from '@/features/authentication/infrastructure/bcrypt-hasher.ts';
import { DrizzleUserRepository } from '@/features/authentication/infrastructure/drizzle-user.repository.ts';

import { authenticateController } from './authenticate.controller.ts';

const userRepository = new DrizzleUserRepository();
const passwordHashService = new BcryptHasherService();
const authenticateUseCase = new AuthenticateUseCase(userRepository, passwordHashService);
const registerUseCase = new RegisterUseCase(userRepository, passwordHashService);
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);

const authenticationController = authenticateController({
  authenticateUseCase,
  registerUseCase,
  getUserProfileUseCase,
  updateUserUseCase,
});

export const authenticationRoutes = new Elysia().group('/auth', (app) => {
  app.use(authenticationController);

  return app;
});
