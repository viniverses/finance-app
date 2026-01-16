import type { User } from '@/features/authentication/entities/user.ts';
import type { Mapper } from '@/shared/mappers/mapper.ts';
import type { UserResponseDTO } from '../schemas/user.ts';

export class UserMapper implements Mapper<User, UserResponseDTO> {
  toDTO(input: User): UserResponseDTO {
    return {
      id: input.id,
      name: input.name,
      email: input.email,
      telegramId: input.telegramId,
      allowed: input.allowed ?? false,
      createdAt: input.createdAt.toISOString(),
      updatedAt: input.updatedAt?.toISOString() ?? null,
    };
  }
}
