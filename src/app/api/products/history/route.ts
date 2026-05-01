import { NextResponse } from "next/server";
import { In } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { ShoppingList } from "@/server/db/entities/ShoppingList";
import { ShoppingListItem } from "@/server/db/entities/ShoppingListItem";
import { Purchase } from "@/server/db/entities/Purchase";
import { PurchaseItem } from "@/server/db/entities/PurchaseItem";
import { apiT } from "@/i18n/api-translate";
import { translate } from "@/i18n/dictionaries";
import { langFromRequest } from "@/i18n/locale-from-request";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  const query = (req.nextUrl.searchParams.get("q") || "").trim();
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const unitFallback = translate(langFromRequest(req), "purchase.unitFallback");

  const listIds = (await db.getRepository(ShoppingList).find({ where: { familyId }, select: { id: true } })).map((l) => l.id);
  const purchaseIds = (await db.getRepository(Purchase).find({ where: { familyId }, select: { id: true } })).map((p) => p.id);

  const [listItems, purchaseItems] = await Promise.all([
    listIds.length
      ? db.getRepository(ShoppingListItem).find({ where: { listId: In(listIds) } })
      : Promise.resolve([] as ShoppingListItem[]),
    purchaseIds.length
      ? db.getRepository(PurchaseItem).find({ where: { purchaseId: In(purchaseIds) } })
      : Promise.resolve([] as PurchaseItem[]),
  ]);

  const map = new Map<string, { name: string; categoryId: string | null; brandId: string | null; unit: string }>();

  listItems.forEach((item) => {
    const key = item.name.trim().toLowerCase();
    if (!map.has(key)) map.set(key, { name: item.name, categoryId: item.categoryId ?? null, brandId: item.brandId ?? null, unit: item.unit || unitFallback });
  });

  purchaseItems.forEach((item) => {
    const key = item.productName.trim().toLowerCase();
    if (!map.has(key)) map.set(key, { name: item.productName, categoryId: item.categoryId ?? null, brandId: item.brandId ?? null, unit: item.unit || unitFallback });
  });

  const products = [...map.values()]
    .filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 20);

  return NextResponse.json({ products });
}
