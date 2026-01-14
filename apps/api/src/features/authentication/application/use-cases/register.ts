import { randomUUID } from 'node:crypto';

import type { User } from '@/features/authentication/entities/user.ts';
import type { UserRepository } from '@/features/authentication/repositories/user.ts';
import type { PasswordHasherService } from '@/features/authentication/services/password-hasher.ts';
import { ConflictError } from '@/shared/errors/conflict.ts';

export type RegisterUseCaseRequest = {
  email: string;
  name: string;
  password: string;
};

export type RegisterUseCaseResponse = User;

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHashService: PasswordHasherService
  ) {}

  async execute({
    email,
    name,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      throw new ConflictError({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already registered',
      });
    }

    const passwordHash = await this.passwordHashService.hash(password);

    const newUser: User = {
      id: randomUUID(),
      name,
      email,
      passwordHash,
      telegramId: null,
      allowed: false,
      createdAt: new Date(),
      updatedAt: null,
    };

    const createdUser = await this.userRepository.save(newUser);

    return createdUser;
  }
}
