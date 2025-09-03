import {
  Category,
  Item,
  Mark,
  Purchase,
  PurchaseItem,
  Supermarket,
} from "@prisma/client";

export type Delegate = {
  findUnique(args: any): Promise<any>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
  findMany(args?: any): Promise<any>;
};

export type ModelType<T extends Delegate> = NonNullable<
  Awaited<ReturnType<T["findUnique"]>>
>;

export type CreateInputType<T extends Delegate> = Parameters<
  T["create"]
>[0]["data"];

export type UpdateInputType<T extends Delegate> = Parameters<
  T["update"]
>[0]["data"];

export type ItemData = {
  name: string;
  categoryId: string;
};

export type PurchaseItemDTO = {
  itemId: string;
  quantity: number;
  price: number;
};

export type CreatePurchaseDTO = {
  date: string | Date;
  supermarketId: string;
  items: PurchaseItemDTO[];
};

export type ItemWithRelations = Item & {
  category: Category;
  mark: Mark;
};

export type PurchaseItemWithDetails = PurchaseItem & {
  item: ItemWithRelations;
};

export type PurchaseWithDetails = Purchase & {
  supermarket: Supermarket;
  items: PurchaseItemWithDetails[];
};

export type NamedEntityData = {
  name: string;
};

export type ItemCreateData = {
  name: string;
  categoryId: string;
  markId: string;
};

export type PurchaseItemData = {
  itemId: string;
  quantity: number;
  price: number;
};

export type PurchaseCreateData = {
  date: string | Date;
  supermarketId: string;
  items: PurchaseItemData[];
};
