import type { BaseRepository } from '@/shared/repositories/base.repository.ts';

import type { User } from '../entities/user.entity.ts';

export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
