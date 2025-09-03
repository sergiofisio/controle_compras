import * as purchaseRepository from "../repositories/purchaseRepository";
import { supermarketService } from "./supermarketService";
import { findItemById } from "./itemService";
import { CreatePurchaseDTO } from "../type/type";

export async function listPurchases() {
  return purchaseRepository.getAllPurchases();
}

export async function findPurchaseById(id: string) {
  const purchase = await purchaseRepository.getPurchaseById(id);
  if (!purchase) {
    throw new Error("Purchase not found.");
  }
  return purchase;
}

export async function createNewPurchase(data: CreatePurchaseDTO) {
  await supermarketService.findById(data.supermarketId);

  if (!data.items || data.items.length === 0) {
    throw new Error("Purchase must have at least one item.");
  }
  await Promise.all(data.items.map((item) => findItemById(item.itemId)));

  const totalValue = data.items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const purchaseToCreate = {
    date: new Date(data.date),
    totalValue,
    supermarket: {
      connect: { id: data.supermarketId },
    },
    items: {
      create: data.items.map((item) => ({
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        item: {
          connect: { id: item.itemId },
        },
      })),
    },
  };

  return purchaseRepository.createPurchase(purchaseToCreate);
}

export async function removePurchase(id: string) {
  await findPurchaseById(id);
  return purchaseRepository.deletePurchase(id);
}
