// src/backend/services/categoryService.ts
import { categoryRepository } from "../repositories/categoryRepository";
import { createBaseService } from "./baseService";
import { namedEntitySchema } from "../lib/schemas";

type CategoryCreateInput = { name: string };
type CategoryUpdateInput = Partial<CategoryCreateInput>;

const baseService = createBaseService<CategoryCreateInput, CategoryUpdateInput>(
  categoryRepository,
  "Category"
);

export const categoryService = {
  ...baseService,

  async add(data: CategoryCreateInput) {
    const validatedData = namedEntitySchema.parse(data);
    try {
      return await categoryRepository.create(validatedData);
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new Error("Uma categoria com este nome já existe.");
      }
      throw error;
    }
  },

  async edit(id: string, data: CategoryUpdateInput) {
    const validatedData = namedEntitySchema.parse(data);
    await baseService.findById(id);

    try {
      return await categoryRepository.update(id, validatedData);
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new Error("Uma categoria com este nome já existe.");
      }
      throw error;
    }
  },
};
