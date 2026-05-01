import { NextResponse } from "next/server";
import { In } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Purchase } from "@/server/db/entities/Purchase";
import { PurchaseItem } from "@/server/db/entities/PurchaseItem";
import { PriceHistory } from "@/server/db/entities/PriceHistory";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  const productName = req.nextUrl.searchParams.get("productName");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const purchases = await db.getRepository(Purchase).find({ where: { familyId } });
  const items = purchases.length ? await db.getRepository(PurchaseItem).find({ where: { purchaseId: In(purchases.map((p) => p.id)) } }) : [];

  const total = items.reduce((acc, item) => {
    if (item.lineTotal && item.lineTotal > 0) return acc + item.lineTotal;
    return acc + item.price * item.quantity;
  }, 0);

  const historyRepo = db.getRepository(PriceHistory);
  const history = productName ? await historyRepo.find({ where: { productName }, order: { createdAt: "ASC" } }) : [];
  const variation = history.length >= 2 ? ((history[history.length - 1].price - history[0].price) / history[0].price) * 100 : 0;

  return NextResponse.json({
    totalSpent: total,
    purchasesCount: purchases.length,
    averageTicket: purchases.length ? total / purchases.length : 0,
    priceVariationPercent: Number(variation.toFixed(2)),
    history,
  });
}
