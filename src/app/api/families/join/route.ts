import { IsNull, MoreThan } from "typeorm";
import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyInvite } from "@/server/db/entities/FamilyInvite";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { logAccess } from "@/server/logging/audit";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { inviteCode } = await req.json();
  if (!inviteCode) return NextResponse.json({ error: apiT(req, "api.inviteCodeRequired") }, { status: 400 });

  const db = await ensureDb();
  const inviteRepo = db.getRepository(FamilyInvite);
  const memberRepo = db.getRepository(FamilyMember);

  const invite = await inviteRepo.findOne({ where: { inviteCode: String(inviteCode).trim().toUpperCase(), usedAt: IsNull(), expiresAt: MoreThan(new Date()) } });
  if (!invite) return NextResponse.json({ error: apiT(req, "api.inviteInvalidExpired") }, { status: 400 });

  const alreadyMember = await memberRepo.findOne({ where: { familyId: invite.familyId, userId: session.userId } });
  if (!alreadyMember) {
    await memberRepo.save(memberRepo.create({ familyId: invite.familyId, userId: session.userId, role: "member" }));
  }

  invite.usedAt = new Date();
  invite.usedByUserId = session.userId;
  await inviteRepo.save(invite);

  await logAccess({
    action: "family.join",
    userId: session.userId,
    email: session.email,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    metadata: { familyId: invite.familyId },
  });

  return NextResponse.json({ message: apiT(req, "api.joinFamilySuccess"), familyId: invite.familyId });
}
