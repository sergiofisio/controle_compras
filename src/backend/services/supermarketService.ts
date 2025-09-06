import { Prisma } from "@prisma/client";
import prisma from "@/backend/lib/prisma";
import { namedEntitySchema } from "@/backend/lib/schemas";

export async function listSupermarkets(userId: string) {
  return prisma.supermarket.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function findById(id: string, userId: string) {
  const supermarket = await prisma.supermarket.findUnique({
    where: { id, userId },
  });
  if (!supermarket) throw new Error("Supermarket not found.");
  return supermarket;
}

export async function add(data: { name: string }, userId: string) {
  const validatedData = namedEntitySchema.parse(data);
  try {
    return await prisma.supermarket.create({
      data: { ...validatedData, userId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Um supermercado com este nome já existe.");
    }
    throw error;
  }
}

export async function edit(id: string, data: { name: string }, userId: string) {
  const validatedData = namedEntitySchema.parse(data);
  await findById(id, userId);
  try {
    return await prisma.supermarket.update({
      where: { id },
      data: validatedData,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Um supermercado com este nome já existe.");
    }
    throw error;
  }
}

export async function remove(id: string, userId: string) {
  await findById(id, userId);
  return prisma.supermarket.delete({ where: { id } });
}
