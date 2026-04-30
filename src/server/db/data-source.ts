import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "@/server/db/entities/User";
import { Family } from "@/server/db/entities/Family";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Store } from "@/server/db/entities/Store";
import { Product } from "@/server/db/entities/Product";
import { ShoppingList } from "@/server/db/entities/ShoppingList";
import { ShoppingListItem } from "@/server/db/entities/ShoppingListItem";
import { Purchase } from "@/server/db/entities/Purchase";
import { PurchaseItem } from "@/server/db/entities/PurchaseItem";
import { PriceHistory } from "@/server/db/entities/PriceHistory";
import { PasswordResetToken } from "@/server/db/entities/PasswordResetToken";
import { PurchaseDraft } from "@/server/db/entities/PurchaseDraft";
import { FamilyInvite } from "@/server/db/entities/FamilyInvite";
import { Category } from "@/server/db/entities/Category";
import { Brand } from "@/server/db/entities/Brand";
import { AccessLog } from "@/server/db/entities/AccessLog";
import { UserPhone } from "@/server/db/entities/UserPhone";
import { UserAddress } from "@/server/db/entities/UserAddress";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [
    User,
    UserPhone,
    UserAddress,
    Family,
    FamilyMember,
    Store,
    Product,
    ShoppingList,
    ShoppingListItem,
    Purchase,
    PurchaseItem,
    PriceHistory,
    PasswordResetToken,
    PurchaseDraft,
    FamilyInvite,
    Category,
    Brand,
    AccessLog,
  ],
  migrations: process.env.TYPEORM_CLI === "true" ? ["src/server/db/migrations/*.ts"] : [],
});

let initialized = false;

export async function ensureDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada.");
  }
  if (!initialized) {
    await AppDataSource.initialize();
    initialized = true;
  }
  return AppDataSource;
}
