// src/backend/repositories/purchaseRepository.ts
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const createPurchase = (data: Prisma.PurchaseCreateInput) => {
  return prisma.purchase.create({
    data,
  });
};

export const getAllPurchases = () => {
  return prisma.purchase.findMany({
    orderBy: { date: "desc" },
    include: {
      supermarket: true,
      items: {
        include: {
          item: {
            include: {
              category: true,
              mark: true,
            },
          },
        },
      },
    },
  });
};

export const getPurchaseById = (id: string) => {
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      supermarket: true,
      items: {
        include: {
          item: true,
        },
      },
    },
  });
};

export const deletePurchase = (id: string) => {
  return prisma.purchase.delete({ where: { id } });
};
