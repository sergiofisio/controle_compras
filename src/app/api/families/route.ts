import { NextResponse } from "next/server";
import { In } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Family } from "@/server/db/entities/Family";
import { getSessionFromRequest } from "@/server/auth/session";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const db = await ensureDb();
  const memberships = await db.getRepository(FamilyMember).find({ where: { userId: session.userId } });
  const ids = memberships.map((m) => m.familyId);
  const families = ids.length ? await db.getRepository(Family).find({ where: { id: In(ids) } }) : [];

  return NextResponse.json({
    families: memberships
      .map((m) => {
        const family = families.find((f) => f.id === m.familyId);
        if (!family) return null;
        return { id: family.id, name: family.name, role: m.role, inviteCode: family.inviteCode };
      })
      .filter(Boolean),
  });
}
