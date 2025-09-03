// src/backend/repositories/supermarketRepository.ts
import prisma from "../lib/prisma";
import { createBaseRepository } from "./baseRepository";

export const supermarketRepository = createBaseRepository(prisma.supermarket);
