import { randomBytes } from "crypto";
import { IsNull, MoreThan } from "typeorm";
import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { FamilyInvite } from "@/server/db/entities/FamilyInvite";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { familyId } = await req.json();
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member || member.role !== "owner") return NextResponse.json({ error: apiT(req, "api.onlyOwnerInvite") }, { status: 403 });

  const inviteRepo = db.getRepository(FamilyInvite);
  const activeInvite = await inviteRepo.findOne({ where: { familyId, usedAt: IsNull(), expiresAt: MoreThan(new Date()) }, order: { createdAt: "DESC" } });
  if (activeInvite) {
    return NextResponse.json({ invite: activeInvite });
  }

  const inviteCode = randomBytes(4).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const invite = await inviteRepo.save(inviteRepo.create({ familyId, createdByUserId: session.userId, inviteCode, expiresAt, usedAt: null, usedByUserId: null }));
  return NextResponse.json({ invite }, { status: 201 });
}
