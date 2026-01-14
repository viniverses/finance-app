import type { User } from '@/features/authentication/entities/user.entity.ts';
import type { UserRepository } from '@/features/authentication/repositories/user.repository.ts';
import { NotFoundError } from '@/shared/errors/not-found-error.ts';

export type UpdateUserRequest = {
  id: string;
  name?: string;
  email?: string;
  telegramId?: string | null;
};

export type UpdateUserResponse = User;

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ id, name, email, telegramId }: UpdateUserRequest): Promise<UpdateUserResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    const updatedUser: User = {
      ...user,
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(telegramId !== undefined && { telegramId }),
      updatedAt: new Date(),
    };

    const savedUser = await this.userRepository.save(updatedUser);

    return savedUser;
  }
}
