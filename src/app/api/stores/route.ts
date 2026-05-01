import { NextResponse } from "next/server";
import { ILike } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { Store } from "@/server/db/entities/Store";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const familyId = searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const memberRepo = db.getRepository(FamilyMember);
  const membership = await memberRepo.findOne({ where: { familyId, userId: session.userId } });
  if (!membership) return NextResponse.json({ error: apiT(req, "api.noFamilyAccess") }, { status: 403 });

  const stores = await db.getRepository(Store).find({ where: { familyId }, order: { name: "ASC" } });
  return NextResponse.json({ stores });
}

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { name, type, familyId } = await req.json();
  if (!name || !type || !familyId) return NextResponse.json({ error: apiT(req, "api.storeFieldsRequired") }, { status: 400 });

  const db = await ensureDb();
  const storeRepo = db.getRepository(Store);
  const memberRepo = db.getRepository(FamilyMember);

  const membership = await memberRepo.findOne({ where: { familyId, userId: session.userId } });
  if (!membership) return NextResponse.json({ error: apiT(req, "api.noFamilyAccess") }, { status: 403 });

  const normalizedName = String(name).trim();
  const normalizedType = String(type).trim().toLowerCase();

  const existing = await storeRepo.findOne({ where: { familyId, type: normalizedType, name: ILike(normalizedName) } });
  if (existing) return NextResponse.json({ store: existing });

  const store = await storeRepo.save(storeRepo.create({ name: normalizedName, type: normalizedType, familyId }));
  return NextResponse.json({ store }, { status: 201 });
}
