import { NextResponse } from "next/server";
import { Between, In } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Purchase } from "@/server/db/entities/Purchase";
import { PurchaseItem } from "@/server/db/entities/PurchaseItem";
import { PriceHistory } from "@/server/db/entities/PriceHistory";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

type IncomingItem = {
  productName: string;
  price: number;
  quantity?: number;
  unit?: string;
  categoryId?: string | null;
  brandId?: string | null;
  discountType?: "none" | "percent" | "bulk";
  discountPercent?: number | null;
  promoQty?: number | null;
  promoPrice?: number | null;
};

function calculateLine(item: IncomingItem) {
  const quantity = Number(item.quantity ?? 1);
  const unitPrice = Number(item.price);
  const discountType = item.discountType ?? "none";

  if (discountType === "percent") {
    const percent = Math.min(100, Math.max(0, Number(item.discountPercent ?? 0)));
    const lineTotal = quantity * unitPrice * (1 - percent / 100);
    return { lineTotal, finalUnitPrice: quantity ? lineTotal / quantity : unitPrice };
  }

  if (discountType === "bulk") {
    const promoQty = Math.max(1, Number(item.promoQty ?? 1));
    const promoPrice = Math.max(0, Number(item.promoPrice ?? 0));
    const bundles = Math.floor(quantity / promoQty);
    const rest = quantity % promoQty;
    const lineTotal = bundles * promoPrice + rest * unitPrice;
    return { lineTotal, finalUnitPrice: quantity ? lineTotal / quantity : unitPrice };
  }

  const lineTotal = quantity * unitPrice;
  return { lineTotal, finalUnitPrice: unitPrice };
}

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const purchases =
    from && to
      ? await db.getRepository(Purchase).find({
          where: { familyId, createdAt: Between(new Date(from), new Date(to)) },
          order: { createdAt: "DESC" },
        })
      : await db.getRepository(Purchase).find({
          where: { familyId },
          order: { createdAt: "DESC" },
        });

  const items = purchases.length ? await db.getRepository(PurchaseItem).find({ where: { purchaseId: In(purchases.map((p) => p.id)) } }) : [];
  const merged = purchases.map((purchase) => ({ ...purchase, items: items.filter((i) => i.purchaseId === purchase.id) }));

  return NextResponse.json({ purchases: merged });
}

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { familyId, storeName, items } = await req.json();
  const db = await ensureDb();

  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const purchase = await db.getRepository(Purchase).save(db.getRepository(Purchase).create({ familyId, storeName }));

  const savedItems = await Promise.all(
    (items ?? []).map((i: IncomingItem) => {
      const quantity = Number(i.quantity ?? 1);
      const price = Number(i.price);
      const { lineTotal, finalUnitPrice } = calculateLine(i);

      return db.getRepository(PurchaseItem).save(
        db.getRepository(PurchaseItem).create({
          purchaseId: purchase.id,
          productName: i.productName,
          categoryId: i.categoryId ?? null,
          brandId: i.brandId ?? null,
          unit: i.unit || "unidade",
          price,
          quantity,
          discountType: i.discountType ?? "none",
          discountPercent: i.discountType === "percent" ? Number(i.discountPercent ?? 0) : null,
          promoQty: i.discountType === "bulk" ? Number(i.promoQty ?? 1) : null,
          promoPrice: i.discountType === "bulk" ? Number(i.promoPrice ?? 0) : null,
          lineTotal,
          finalUnitPrice,
        }),
      );
    }),
  );

  await Promise.all(
    savedItems.map((item) =>
      db.getRepository(PriceHistory).save(
        db.getRepository(PriceHistory).create({
          productName: item.productName,
          storeName,
          price: item.finalUnitPrice,
        }),
      ),
    ),
  );

  return NextResponse.json({ purchase: { ...purchase, items: savedItems } }, { status: 201 });
}
