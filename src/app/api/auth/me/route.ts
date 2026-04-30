import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/server/auth/session";
import { ensureDb } from "@/server/db/data-source";
import { User } from "@/server/db/entities/User";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  const db = await ensureDb();
  const user = await db.getRepository(User).findOne({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { ...session, isAdmin: user.isAdmin } });
}
