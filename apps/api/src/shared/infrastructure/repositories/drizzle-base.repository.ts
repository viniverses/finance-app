import { db } from 'db/client.ts';
import { eq } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import { RepositoryError } from '@/shared/errors/repository-error.ts';
import type { BaseRepository } from '@/shared/repositories/base.repository.ts';

export abstract class DrizzleBaseRepository<TEntity> implements BaseRepository<TEntity> {
  protected abstract readonly schema: PgTable;

  private getTableName(): string {
    return (this.schema as unknown as { name: string }).name;
  }

  private getIdColumn(): PgColumn {
    return (this.schema as unknown as { id: PgColumn }).id;
  }

  private handleError(operation: string, error: unknown): never {
    console.error(`Failed to ${operation} ${this.getTableName()}:`, error);
    throw new RepositoryError(operation, this.getTableName(), error);
  }

  async findById(id: string): Promise<TEntity | null> {
    try {
      const result = await db.select().from(this.schema).where(eq(this.getIdColumn(), id)).limit(1);

      return (result[0] as TEntity) ?? null;
    } catch (error) {
      this.handleError('find', error);
    }
  }

  async findAll(): Promise<TEntity[]> {
    try {
      const queryResult = await db.select().from(this.schema);

      return queryResult as TEntity[];
    } catch (error) {
      this.handleError('find all', error);
    }
  }

  async save(entity: TEntity): Promise<TEntity> {
    try {
      const created = await db
        .insert(this.schema)
        .values(entity as Record<string, unknown>)
        .onConflictDoUpdate({
          target: this.getIdColumn(),
          set: entity as Record<string, unknown>,
        })
        .returning();

      const saved = Array.isArray(created) ? created[0] : created;

      if (!saved) {
        throw new RepositoryError('save', this.getTableName(), undefined);
      }

      return saved as TEntity;
    } catch (error) {
      this.handleError('save', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.delete(this.schema).where(eq(this.getIdColumn(), id));
    } catch (error) {
      this.handleError('delete', error);
    }
  }
}
