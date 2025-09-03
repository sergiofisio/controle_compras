// src/backend/lib/schemas.ts
import { z } from "zod";

export const namedEntitySchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "O nome é obrigatório e deve ter no mínimo 2 caracteres.",
    })
    .max(50, { message: "O nome deve ter no máximo 50 caracteres." }),
});

export const createItemSchema = z.object({
  name: z.string().min(2).max(50),
  categoryId: z.cuid({ message: "O ID da categoria é inválido." }),
  markId: z.string().cuid("O ID da marca é inválido."),
});

export const updateItemSchema = createItemSchema.partial();

const purchaseItemSchema = z.object({
  itemId: z
    .cuid({ message: "O ID do item é inválido." })
    .nonempty({ message: "O ID do item é obrigatório." }),

  quantity: z
    .number({ message: "A quantidade deve ser um número." })
    .int({ message: "A quantidade deve ser um número inteiro." })
    .positive({ message: "A quantidade deve ser um número positivo." }),

  price: z
    .number({ message: "O preço deve ser um número." })
    .positive({ message: "O preço deve ser um número positivo." }),
});

export const createPurchaseSchema = z.object({
  date: z.iso
    .datetime("A data deve estar no formato ISO 8601.")
    .nonempty("A data é obrigatória."),

  supermarketId: z
    .cuid({ message: "O ID do supermercado é inválido." })
    .nonempty({ message: "O ID do supermercado é obrigatório." }),

  items: z
    .array(purchaseItemSchema)
    .min(1, { message: "A compra deve ter pelo menos um item." }),
});
