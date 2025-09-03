// src/backend/services/baseService.ts
import { createBaseRepository } from "../repositories/baseRepository";

type GenericRepository = ReturnType<typeof createBaseRepository>;

export function createBaseService<TCreateInput, TUpdateInput>(
  repository: GenericRepository,
  modelName: string
) {
  return {
    async list() {
      return repository.getAll();
    },

    async findById(id: string) {
      const item = await repository.getById(id);
      if (!item) {
        throw new Error(`${modelName} not found.`);
      }
      return item;
    },

    async add(data: TCreateInput) {
      return repository.create(data);
    },

    async edit(id: string, data: TUpdateInput) {
      await this.findById(id);
      return repository.update(id, data);
    },

    async remove(id: string) {
      await this.findById(id);
      return repository.delete(id);
    },
  };
}
