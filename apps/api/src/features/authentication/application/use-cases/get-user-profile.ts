import type { User } from '@/features/authentication/entities/user.ts';
import type { UserRepository } from '@/features/authentication/repositories/user.ts';
import { NotFoundError } from '@/shared/errors/not-found.ts';

export type GetUserProfileRequest = {
  id: string;
};

export type GetUserProfileResponse = User;

export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    id,
  }: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    return user;
  }
}
