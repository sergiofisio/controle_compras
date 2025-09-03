import * as itemRepository from "../repositories/itemRepository";
import { categoryService } from "./categoryService";
import { markService } from "./markService";
import { createItemSchema, updateItemSchema } from "../lib/schemas";

type ItemCreateData = {
  name: string;
  categoryId: string;
  markId: string;
};
type ItemUpdateData = Partial<ItemCreateData>;

export async function listItems() {
  return itemRepository.getAllItems();
}

export async function findItemById(id: string) {
  const item = await itemRepository.getItemById(id);
  if (!item) throw new Error("Item not found.");
  return item;
}

export async function addItem(data: ItemCreateData) {
  const validatedData = createItemSchema.parse(data);

  await categoryService.findById(validatedData.categoryId);
  await markService.findById(validatedData.markId);

  try {
    return await itemRepository.createItem(validatedData);
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new Error("Um item com este nome já existe.");
    }
    throw error;
  }
}

export async function editItem(id: string, data: ItemUpdateData) {
  const validatedData = updateItemSchema.parse(data);
  await findItemById(id);

  if (validatedData.categoryId) {
    await categoryService.findById(validatedData.categoryId);
  }
  if (validatedData.markId) {
    await markService.findById(validatedData.markId);
  }

  try {
    return await itemRepository.updateItem(id, validatedData);
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new Error("Um item com este nome já existe.");
    }
    throw error;
  }
}

export async function removeItem(id: string) {
  await findItemById(id);
  return itemRepository.deleteItem(id);
}
