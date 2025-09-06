import prisma from "@/backend/lib/prisma";
import { Prisma } from "@prisma/client";
import { createItemSchema, updateItemSchema } from "@/backend/lib/schemas";
import { findById as findCategoryById } from "./categoryService";
import { findById as findMarkById } from "./markService";
import { z } from "zod";

type ItemCreateData = z.infer<typeof createItemSchema>;
type ItemUpdateData = z.infer<typeof updateItemSchema>;

export async function listItems(userId: string) {
  return prisma.item.findMany({
    where: { userId },
    include: { category: true, mark: true },
    orderBy: { name: "asc" },
  });
}

export async function findItemById(id: string, userId: string) {
  const item = await prisma.item.findUnique({
    where: { id, userId },
    include: { category: true, mark: true },
  });
  if (!item) throw new Error("Item not found.");
  return item;
}

export async function addItem(data: ItemCreateData, userId: string) {
  const validatedData = createItemSchema.parse(data);

  // Valida se a categoria e a marca pertencem ao usuário
  await findCategoryById(validatedData.categoryId, userId);
  await findMarkById(validatedData.markId, userId);

  try {
    return await prisma.item.create({ data: { ...validatedData, userId } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Um item com este nome e marca já existe.");
    }
    throw error;
  }
}

export async function editItem(
  id: string,
  data: ItemUpdateData,
  userId: string
) {
  const validatedData = updateItemSchema.parse(data);
  await findItemById(id, userId);

  if (validatedData.categoryId)
    await findCategoryById(validatedData.categoryId, userId);
  if (validatedData.markId) await findMarkById(validatedData.markId, userId);

  try {
    return await prisma.item.update({ where: { id }, data: validatedData });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Um item com este nome e marca já existe.");
    }
    throw error;
  }
}

export async function removeItem(id: string, userId: string) {
  await findItemById(id, userId);
  return prisma.item.delete({ where: { id } });
}
