import prisma from "@/backend/lib/prisma";
import { createPurchaseSchema } from "@/backend/lib/schemas";
import { findById as findSupermarketById } from "./supermarketService";
import { findItemById } from "./itemService";
import { z } from "zod";

type CreatePurchaseDTO = z.infer<typeof createPurchaseSchema>;

export async function listPurchases(userId: string) {
  return prisma.purchase.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: {
      /* ... (includes aninhados) ... */
    },
  });
}

export async function findPurchaseById(id: string, userId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id, userId },
    include: {
      /* ... (includes aninhados) ... */
    },
  });
  if (!purchase) throw new Error("Purchase not found.");
  return purchase;
}

export async function createNewPurchase(
  data: CreatePurchaseDTO,
  userId: string
) {
  const validatedData = createPurchaseSchema.parse(data);

  await findSupermarketById(validatedData.supermarketId, userId);
  await Promise.all(
    validatedData.items.map((item) => findItemById(item.itemId, userId))
  );

  const totalValue = validatedData.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return prisma.purchase.create({
    data: {
      date: validatedData.date,
      totalValue,
      supermarketId: validatedData.supermarketId,
      userId,
      items: {
        create: validatedData.items.map((item) => ({
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
          itemId: item.itemId,
        })),
      },
    },
  });
}

export async function removePurchase(id: string, userId: string) {
  await findPurchaseById(id, userId);
  return prisma.purchase.delete({ where: { id } });
}
