import { Prisma } from "@prisma/client";
import prisma from "@/backend/lib/prisma";
import { namedEntitySchema } from "@/backend/lib/schemas";

export async function listMarks(userId: string) {
  return prisma.mark.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function findById(id: string, userId: string) {
  const mark = await prisma.mark.findUnique({ where: { id, userId } });
  if (!mark) throw new Error("Mark not found.");
  return mark;
}

export async function add(data: { name: string }, userId: string) {
  const validatedData = namedEntitySchema.parse(data);
  try {
    return await prisma.mark.create({ data: { ...validatedData, userId } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Uma marca com este nome já existe.");
    }
    throw error;
  }
}

export async function edit(id: string, data: { name: string }, userId: string) {
  const validatedData = namedEntitySchema.parse(data);
  await findById(id, userId);
  try {
    return await prisma.mark.update({ where: { id }, data: validatedData });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Uma marca com este nome já existe.");
    }
    throw error;
  }
}

export async function remove(id: string, userId: string) {
  await findById(id, userId);
  return prisma.mark.delete({ where: { id } });
}
