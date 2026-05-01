import { NextResponse } from "next/server";
import { In } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { User } from "@/server/db/entities/User";
import { getSessionFromRequest } from "@/server/auth/session";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const membershipRepo = db.getRepository(FamilyMember);
  const hasAccess = await membershipRepo.findOne({ where: { familyId, userId: session.userId } });
  if (!hasAccess) return NextResponse.json({ error: apiT(req, "api.noFamilyAccess") }, { status: 403 });

  const members = await membershipRepo.find({ where: { familyId } });
  const userIds = members.map((member) => member.userId);
  const users = userIds.length ? await db.getRepository(User).find({ where: { id: In(userIds) } }) : [];

  const payload = members.map((member) => {
    const user = users.find((item) => item.id === member.userId);
    return {
      id: member.id,
      userId: member.userId,
      name: user?.name || "Usuario",
      email: user?.email || "",
      role: member.role,
    };
  });

  return NextResponse.json({ members: payload });
}
