import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { PurchaseDraft } from "@/server/db/entities/PurchaseDraft";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

async function ensureMember(familyId: string, userId: string) {
  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId } });
  return { db, member };
}

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const { db, member } = await ensureMember(familyId, session.userId);
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const draft = await db.getRepository(PurchaseDraft).findOne({ where: { familyId, userId: session.userId } });
  return NextResponse.json({ draft: draft ?? null });
}

export async function PUT(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { familyId, storeName, cartItems } = await req.json();
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const { db, member } = await ensureMember(familyId, session.userId);
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const repo = db.getRepository(PurchaseDraft);
  let draft = await repo.findOne({ where: { familyId, userId: session.userId } });
  if (!draft) {
    draft = repo.create({ familyId, userId: session.userId, storeName: storeName ?? null, cartItems: cartItems ?? [] });
  } else {
    draft.storeName = storeName ?? null;
    draft.cartItems = cartItems ?? [];
  }

  await repo.save(draft);
  return NextResponse.json({ draft });
}

export async function DELETE(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const { db, member } = await ensureMember(familyId, session.userId);
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  await db.getRepository(PurchaseDraft).delete({ familyId, userId: session.userId });
  return NextResponse.json({ ok: true });
}
