import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/server/auth/session";
import { ensureDb } from "@/server/db/data-source";
import { User } from "@/server/db/entities/User";

export async function requireAdmin(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return { error: NextResponse.json({ error: "Nao autorizado" }, { status: 401 }), user: null };

  const db = await ensureDb();
  const user = await db.getRepository(User).findOne({ where: { id: session.userId } });

  if (!user || !user.isAdmin) {
    return { error: NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 }), user: null };
  }

  return { error: null, user };
}
