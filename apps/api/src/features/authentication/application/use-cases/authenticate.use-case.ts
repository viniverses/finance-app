import type { UserRepository } from '@/features/authentication/repositories/user.repository.ts';
import type { PasswordHasherService } from '@/features/authentication/services/password-hasher.service.ts';
import { UnauthorizedError } from '@/shared/errors/unauthorized-error.ts';

export type AuthenticateUseCaseRequest = {
  email: string;
  password: string;
};

export type AuthenticateUseCaseResponse = {
  id: string;
  email: string;
  name: string;
};

export class AuthenticateUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHashService: PasswordHasherService
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError({
        message: 'Invalid credentials',
        code: 'AUTH_INVALID_CREDENTIALS',
      });
    }

    const isValid = await this.passwordHashService.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedError({
        message: 'Invalid credentials',
        code: 'AUTH_INVALID_CREDENTIALS',
      });
    }

    return user;
  }
}
