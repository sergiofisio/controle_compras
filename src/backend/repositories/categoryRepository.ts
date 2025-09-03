import prisma from "../lib/prisma";
import { createBaseRepository } from "./baseRepository";

export const categoryRepository = createBaseRepository(prisma.category);
