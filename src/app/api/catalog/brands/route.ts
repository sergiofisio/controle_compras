import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Brand } from "@/server/db/entities/catalog/Brand";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const brands = await db.getRepository(Brand).find({ where: [{ isGlobal: true }, { familyId }], order: { name: "ASC" } });
  return NextResponse.json({ brands });
}

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { familyId, name, categoryId } = await req.json();
  if (!familyId || !name) return NextResponse.json({ error: apiT(req, "api.categoryFamilyIdNameRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const repo = db.getRepository(Brand);
  const normalized = String(name).trim();
  const existing = await repo.findOne({ where: [{ name: normalized, isGlobal: true }, { name: normalized, familyId, categoryId: categoryId ?? null }] });
  if (existing) return NextResponse.json({ brand: existing });

  const brand = await repo.save(repo.create({ name: normalized, familyId, isGlobal: false, categoryId: categoryId ?? null }));
  return NextResponse.json({ brand }, { status: 201 });
}
