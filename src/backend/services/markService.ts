// src/backend/services/markService.ts
import { namedEntitySchema } from "../lib/schemas";
import { markRepository } from "../repositories/markRepository";
import { createBaseService } from "./baseService";
import { Prisma } from "@prisma/client";

type MarkCreateInput = Prisma.MarkCreateInput;
type MarkUpdateInput = Prisma.MarkUpdateInput;

const baseService = createBaseService<MarkCreateInput, MarkUpdateInput>(
  markRepository,
  "Mark"
);

export const markService = {
  ...baseService,

  async add(data: MarkCreateInput) {
    const validatedData = namedEntitySchema.parse(data);
    try {
      return await markRepository.create(validatedData);
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new Error("Uma marca com este nome já existe.");
      }
      throw error;
    }
  },

  async edit(id: string, data: MarkUpdateInput) {
    const validatedData = namedEntitySchema.partial().parse(data);
    await baseService.findById(id);
    try {
      return await markRepository.update(id, validatedData);
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new Error("Uma marca com este nome já existe.");
      }
      throw error;
    }
  },
};
