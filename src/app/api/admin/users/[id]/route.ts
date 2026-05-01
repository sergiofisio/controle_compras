import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { requireAdmin } from "@/server/auth/admin";
import { User } from "@/server/db/entities/User";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { PurchaseDraft } from "@/server/db/entities/PurchaseDraft";
import { PasswordResetToken } from "@/server/db/entities/PasswordResetToken";
import { AccessLog } from "@/server/db/entities/AccessLog";
import { logAccess } from "@/server/logging/audit";
import { ensureDeletingUserKeepsAdmin } from "@/server/users/admin-safety";
import { apiT } from "@/i18n/api-translate";
import { langFromRequest } from "@/i18n/locale-from-request";

export const runtime = "nodejs";

export async function DELETE(req: import("next/server").NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const lang = langFromRequest(req);
  const { id } = await ctx.params;
  if (admin.user?.id === id) {
    return NextResponse.json({ error: apiT(req, "api.cannotRemoveSelfAdmin") }, { status: 400 });
  }
  const adminSafety = await ensureDeletingUserKeepsAdmin(id, lang);
  if (!adminSafety.ok) {
    return NextResponse.json({ error: adminSafety.error }, { status: 400 });
  }

  const db = await ensureDb();
  await db.getRepository(FamilyMember).delete({ userId: id });
  await db.getRepository(PurchaseDraft).delete({ userId: id });
  await db.getRepository(PasswordResetToken).delete({ userId: id });
  await db.getRepository(AccessLog).delete({ userId: id });
  await db.getRepository(User).delete({ id });

  await logAccess({
    action: "admin.user.delete",
    userId: admin.user?.id,
    email: admin.user?.email,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    metadata: { deletedUserId: id },
  });

  return NextResponse.json({ ok: true });
}
