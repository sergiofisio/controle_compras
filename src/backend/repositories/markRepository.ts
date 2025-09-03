// src/backend/repositories/markRepository.ts
import prisma from "../lib/prisma";
import { createBaseRepository } from "./baseRepository";

export const markRepository = createBaseRepository(prisma.mark);
