import { User } from "@/server/db/entities/User";
import { ensureDb } from "@/server/db/data-source";

export async function countAdmins(activeOnly = false) {
  const db = await ensureDb();
  return db.getRepository(User).count({
    where: activeOnly ? { isAdmin: true, isActive: true } : { isAdmin: true },
  });
}

export async function ensureDeletingUserKeepsAdmin(userId: string) {
  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const target = await userRepo.findOne({ where: { id: userId } });
  if (!target) return { ok: true as const };
  if (!target.isAdmin) return { ok: true as const };

  const adminsCount = await countAdmins(false);
  if (adminsCount <= 1) {
    return { ok: false as const, error: "Nao e permitido remover o ultimo administrador do sistema" };
  }
  return { ok: true as const };
}

export async function ensureTogglingUserKeepsActiveAdmin(userId: string, nextIsActive: boolean) {
  if (nextIsActive) return { ok: true as const };

  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const target = await userRepo.findOne({ where: { id: userId } });
  if (!target) return { ok: true as const };
  if (!target.isAdmin) return { ok: true as const };

  const activeAdminsCount = await countAdmins(true);
  if (target.isActive && activeAdminsCount <= 1) {
    return { ok: false as const, error: "Nao e permitido desativar o ultimo administrador ativo do sistema" };
  }
  return { ok: true as const };
}
