import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { requireAdmin } from "@/server/auth/admin";
import { User } from "@/server/db/entities/User";
import { logAccess } from "@/server/logging/audit";
import { ensureTogglingUserKeepsActiveAdmin } from "@/server/users/admin-safety";
import { apiT } from "@/i18n/api-translate";
import { langFromRequest } from "@/i18n/locale-from-request";

export const runtime = "nodejs";

export async function PATCH(req: import("next/server").NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const lang = langFromRequest(req);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({} as { isActive?: unknown }));
  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: apiT(req, "api.isActiveRequired") }, { status: 400 });
  }

  if (admin.user?.id === id && body.isActive === false) {
    return NextResponse.json({ error: apiT(req, "api.cannotDeactivateSelfAdmin") }, { status: 400 });
  }

  const safety = await ensureTogglingUserKeepsActiveAdmin(id, body.isActive, lang);
  if (!safety.ok) {
    return NextResponse.json({ error: safety.error }, { status: 400 });
  }

  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOne({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: apiT(req, "api.userNotFound") }, { status: 404 });
  }

  user.isActive = body.isActive;
  await userRepo.save(user);

  await logAccess({
    action: body.isActive ? "admin.user.activate" : "admin.user.deactivate",
    userId: admin.user?.id,
    email: admin.user?.email,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    metadata: { targetUserId: user.id, isActive: user.isActive },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
}
