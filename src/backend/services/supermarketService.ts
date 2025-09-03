import { supermarketRepository } from "../repositories/supermarketRepository";
import { createBaseService } from "./baseService";
import { namedEntitySchema } from "../lib/schemas";

type SupermarketCreateInput = { name: string };
type SupermarketUpdateInput = Partial<SupermarketCreateInput>;

const baseService = createBaseService<
  SupermarketCreateInput,
  SupermarketUpdateInput
>(supermarketRepository, "Supermarket");

export const supermarketService = {
  ...baseService,

  async add(data: SupermarketCreateInput) {
    const validatedData = namedEntitySchema.parse(data);
    try {
      return await supermarketRepository.create(validatedData);
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new Error("Um supermercado com este nome já existe.");
      }
      throw error;
    }
  },

  async edit(id: string, data: SupermarketUpdateInput) {
    const validatedData = namedEntitySchema.parse(data);
    await baseService.findById(id);
    try {
      return await supermarketRepository.update(id, validatedData);
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new Error("Um supermercado com este nome já existe.");
      }
      throw error;
    }
  },
};
