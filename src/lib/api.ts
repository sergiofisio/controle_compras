import {
  ItemCreateData,
  ItemWithRelations,
  NamedEntityData,
  PurchaseCreateData,
  PurchaseWithDetails,
} from "@/backend/type/type";
import apiClient from "./axios";
import type {
  Supermarket,
  Category,
  Mark,
  Item,
  Purchase,
} from "@prisma/client";

export const listSupermarkets = async (): Promise<Supermarket[]> => {
  const response = await apiClient.get("/supermarkets");
  return response.data;
};

export const createSupermarket = async (
  data: NamedEntityData
): Promise<Supermarket> => {
  const response = await apiClient.post("/supermarkets", data);
  return response.data;
};

export const updateSupermarket = async (
  id: string,
  data: NamedEntityData
): Promise<Supermarket> => {
  const response = await apiClient.put(`/supermarkets/${id}`, data);
  return response.data;
};

export const deleteSupermarket = async (id: string): Promise<void> => {
  await apiClient.delete(`/supermarkets/${id}`);
};

export const listCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get("/categories");
  return response.data;
};

export const createCategory = async (
  data: NamedEntityData
): Promise<Category> => {
  const response = await apiClient.post("/categories", data);
  return response.data;
};

export const updateCategory = async (
  id: string,
  data: NamedEntityData
): Promise<Category> => {
  const response = await apiClient.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};

export const listMarks = async (): Promise<Mark[]> => {
  const response = await apiClient.get("/marks");
  return response.data;
};

export const createMark = async (data: NamedEntityData): Promise<Mark> => {
  const response = await apiClient.post("/marks", data);
  return response.data;
};

export const updateMark = async (
  id: string,
  data: NamedEntityData
): Promise<Mark> => {
  const response = await apiClient.put(`/marks/${id}`, data);
  return response.data;
};

export const deleteMark = async (id: string): Promise<void> => {
  await apiClient.delete(`/marks/${id}`);
};

export const listItems = async (): Promise<ItemWithRelations[]> => {
  const response = await apiClient.get("/items");
  return response.data;
};

export const createItem = async (data: ItemCreateData): Promise<Item> => {
  const response = await apiClient.post("/items", data);
  return response.data;
};

export const updateItem = async (
  id: string,
  data: Partial<ItemCreateData>
): Promise<Item> => {
  const response = await apiClient.put(`/items/${id}`, data);
  return response.data;
};

export const deleteItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/items/${id}`);
};

export const listPurchases = async (): Promise<PurchaseWithDetails[]> => {
  const response = await apiClient.get("/purchases");
  return response.data;
};

export const getPurchaseById = async (
  id: string
): Promise<PurchaseWithDetails> => {
  const response = await apiClient.get(`/purchases/${id}`);
  return response.data;
};

export const createPurchase = async (
  data: PurchaseCreateData
): Promise<Purchase> => {
  const response = await apiClient.post("/purchases", data);
  return response.data;
};

export const deletePurchase = async (id: string): Promise<void> => {
  await apiClient.delete(`/purchases/${id}`);
};
