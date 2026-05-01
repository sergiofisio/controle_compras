import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Brand } from "@/server/db/entities/Brand";
import { ShoppingListItem } from "@/server/db/entities/ShoppingListItem";
import { PurchaseItem } from "@/server/db/entities/PurchaseItem";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function DELETE(req: import("next/server").NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { id } = await ctx.params;
  const familyId = req.nextUrl.searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const brandRepo = db.getRepository(Brand);
  const brand = await brandRepo.findOne({ where: { id } });
  if (!brand) return NextResponse.json({ error: apiT(req, "api.brandNotFound") }, { status: 404 });
  if (brand.isGlobal) return NextResponse.json({ error: apiT(req, "api.cannotRemoveGlobalBrand") }, { status: 400 });
  if (brand.familyId !== familyId) return NextResponse.json({ error: apiT(req, "api.brandWrongFamily") }, { status: 403 });

  const [listUsage, purchaseUsage] = await Promise.all([
    db.getRepository(ShoppingListItem).count({ where: { brandId: id } }),
    db.getRepository(PurchaseItem).count({ where: { brandId: id } }),
  ]);

  if (listUsage > 0 || purchaseUsage > 0) {
    return NextResponse.json({ error: apiT(req, "api.brandInUse") }, { status: 409 });
  }

  await brandRepo.delete({ id });
  return NextResponse.json({ ok: true });
}
