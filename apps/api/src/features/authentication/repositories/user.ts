import type { BaseRepository } from '@/shared/repositories/base.ts';

import type { User } from '../entities/user.ts';

export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}

