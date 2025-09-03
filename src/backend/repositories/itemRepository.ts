import prisma from "../lib/prisma";

export const createItem = (data: {
  name: string;
  categoryId: string;
  markId: string;
}) => prisma.item.create({ data });

export const getAllItems = () =>
  prisma.item.findMany({
    include: {
      category: true,
      mark: true,
    },
    orderBy: { name: "asc" },
  });

export const getItemById = (id: string) =>
  prisma.item.findUnique({
    where: { id },
    include: {
      category: true,
      mark: true,
    },
  });

export const updateItem = (
  id: string,
  data: { name?: string; categoryId?: string; markId?: string }
) =>
  prisma.item.update({
    where: { id },
    data,
  });

export const deleteItem = (id: string) => prisma.item.delete({ where: { id } });
