export interface BaseRepository<TEntity> {
  findById(id: string): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  save(entity: TEntity): Promise<TEntity>;
  delete(id: string): Promise<void>;
}

