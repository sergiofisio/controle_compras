import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifySession } from "@/server/auth/jwt";
import { ensureDb } from "@/server/db/data-source";
import { User } from "@/server/db/entities/User";
import { runDailyInactiveUsersSweep } from "@/server/users/activity-sweep";

export async function getSessionFromRequest(req: NextRequest) {
  await runDailyInactiveUsersSweep();
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const session = verifySession(token);
    const db = await ensureDb();
    const user = await db.getRepository(User).findOne({ where: { id: session.userId } });
    if (!user || !user.isActive) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies() {
  await runDailyInactiveUsersSweep();
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  try {
    const session = verifySession(token);
    const db = await ensureDb();
    const user = await db.getRepository(User).findOne({ where: { id: session.userId } });
    if (!user || !user.isActive) return null;
    return session;
  } catch {
    return null;
  }
}
