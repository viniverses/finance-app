import { db } from 'db/client.ts';
import { users } from 'db/schemas/users.ts';
import { eq } from 'drizzle-orm';

import { DrizzleBaseRepository } from '@/shared/infrastructure/repositories/drizzle-base-repository.ts';

import type { User } from '../entities/user.ts';
import type { UserRepository } from '../repositories/user.ts';

export class DrizzleUserRepository
  extends DrizzleBaseRepository<User>
  implements UserRepository
{
  protected readonly schema = users;

  async findByEmail(email: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user ?? null;
  }
}
