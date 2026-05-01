import { translate } from "@/i18n/dictionaries";
import type { Lang } from "@/i18n/types";
import { User } from "@/server/db/entities/User";
import { ensureDb } from "@/server/db/data-source";

export async function countAdmins(activeOnly = false) {
  const db = await ensureDb();
  return db.getRepository(User).count({
    where: activeOnly ? { isAdmin: true, isActive: true } : { isAdmin: true },
  });
}

export async function ensureDeletingUserKeepsAdmin(userId: string, lang: Lang) {
  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const target = await userRepo.findOne({ where: { id: userId } });
  if (!target) return { ok: true as const };
  if (!target.isAdmin) return { ok: true as const };

  const adminsCount = await countAdmins(false);
  if (adminsCount <= 1) {
    return { ok: false as const, error: translate(lang, "api.adminLastAdminRemove") };
  }
  return { ok: true as const };
}

export async function ensureTogglingUserKeepsActiveAdmin(userId: string, nextIsActive: boolean, lang: Lang) {
  if (nextIsActive) return { ok: true as const };

  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const target = await userRepo.findOne({ where: { id: userId } });
  if (!target) return { ok: true as const };
  if (!target.isAdmin) return { ok: true as const };

  const activeAdminsCount = await countAdmins(true);
  if (target.isActive && activeAdminsCount <= 1) {
    return { ok: false as const, error: translate(lang, "api.adminLastActiveDeactivate") };
  }
  return { ok: true as const };
}
