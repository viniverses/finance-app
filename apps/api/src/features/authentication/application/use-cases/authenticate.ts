import type { JwtService } from '@/features/authentication/services/jwt.ts';
import type { UserRepository } from '@/features/authentication/repositories/user.ts';
import type { PasswordHasherService } from '@/features/authentication/services/password-hasher.ts';
import { UnauthorizedError } from '@/shared/errors/unauthorized.ts';

export type AuthenticateUseCaseRequest = {
  email: string;
  password: string;
};

export type AuthenticateUseCaseResponse = {
  accessToken: string;
  refreshToken: string;
};

export class AuthenticateUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHashService: PasswordHasherService,
    private readonly jwtService: JwtService
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

    const isValid = await this.passwordHashService.compare(
      password,
      user.passwordHash
    );

    if (!isValid) {
      throw new UnauthorizedError({
        message: 'Invalid credentials',
        code: 'AUTH_INVALID_CREDENTIALS',
      });
    }

    const tokens = await this.jwtService.sign({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return tokens;
  }
}
