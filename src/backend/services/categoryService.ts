import { Prisma } from "@prisma/client";
import prisma from "@/backend/lib/prisma";
import { namedEntitySchema } from "@/backend/lib/schemas";

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function findById(id: string, userId: string) {
  const category = await prisma.category.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }
  return category;
}

export async function add(data: { name: string }, userId: string) {
  const validatedData = namedEntitySchema.parse(data);

  try {
    return await prisma.category.create({
      data: {
        name: validatedData.name,
        userId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Uma categoria com este nome já existe.");
    }
    throw error;
  }
}

export async function edit(id: string, data: { name: string }, userId: string) {
  const validatedData = namedEntitySchema.parse(data);

  await findById(id, userId);

  try {
    return await prisma.category.update({
      where: { id },
      data: {
        name: validatedData.name,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Uma categoria com este nome já existe.");
    }
    throw error;
  }
}

export async function remove(id: string, userId: string) {
  await findById(id, userId);

  return prisma.category.delete({
    where: { id },
  });
}
