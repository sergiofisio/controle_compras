import { ensureDb } from "@/server/db/data-source";
import { User } from "@/server/db/entities/User";
import { AccessLog } from "@/server/db/entities/AccessLog";

let lastSweepDay = "";

function currentDayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function runDailyInactiveUsersSweep() {
  const dayKey = currentDayKey();
  if (lastSweepDay === dayKey) return;
  lastSweepDay = dayKey;

  try {
    const db = await ensureDb();
    const userRepo = db.getRepository(User);
    const logRepo = db.getRepository(AccessLog);
    const users = await userRepo.find();
    if (users.length === 0) return;

    const rawLastAccess = await logRepo
      .createQueryBuilder("log")
      .select("log.userId", "userId")
      .addSelect("MAX(log.createdAt)", "lastAccessAt")
      .where("log.userId IS NOT NULL")
      .groupBy("log.userId")
      .getRawMany<{ userId: string; lastAccessAt: string }>();

    const lastAccessByUser = new Map<string, Date>();
    rawLastAccess.forEach((row) => {
      if (!row.userId || !row.lastAccessAt) return;
      lastAccessByUser.set(row.userId, new Date(row.lastAccessAt));
    });

    const threshold = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const usersToDeactivate = users
      .filter((user) => user.isActive)
      .filter((user) => !user.isAdmin)
      .filter((user) => {
        const lastAccess = lastAccessByUser.get(user.id) ?? user.createdAt;
        return lastAccess.getTime() < threshold;
      })
      .map((user) => user.id);

    if (usersToDeactivate.length > 0) {
      await userRepo
        .createQueryBuilder()
        .update(User)
        .set({ isActive: false })
        .where("id IN (:...ids)", { ids: usersToDeactivate })
        .execute();
    }
  } catch {
    // Nao interrompe requests por falha na varredura.
  }
}
