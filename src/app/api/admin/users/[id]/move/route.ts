import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { requireAdmin } from "@/server/auth/admin";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { logAccess } from "@/server/logging/audit";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function PUT(req: import("next/server").NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const { id } = await ctx.params;
  const { targetFamilyId, sourceFamilyId } = await req.json();
  if (!targetFamilyId) {
    return NextResponse.json({ error: apiT(req, "api.moveFamilyRequired") }, { status: 400 });
  }

  const db = await ensureDb();
  const repo = db.getRepository(FamilyMember);

  const source = sourceFamilyId
    ? await repo.findOne({ where: { userId: id, familyId: sourceFamilyId } })
    : await repo.findOne({ where: { userId: id } });

  if (source) {
    await repo.delete({ id: source.id });
  }

  const existingTarget = await repo.findOne({ where: { userId: id, familyId: targetFamilyId } });
  if (!existingTarget) {
    await repo.save(repo.create({ userId: id, familyId: targetFamilyId, role: "member" }));
  }

  await logAccess({
    action: "admin.user.move_family",
    userId: admin.user?.id,
    email: admin.user?.email,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    metadata: { movedUserId: id, sourceFamilyId: sourceFamilyId || source?.familyId || null, targetFamilyId },
  });

  return NextResponse.json({ ok: true });
}
