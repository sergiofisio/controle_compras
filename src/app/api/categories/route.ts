import { NextResponse } from "next/server";
import { In, IsNull } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Category } from "@/server/db/entities/Category";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  const db = await ensureDb();
  const repo = db.getRepository(Category);

  if (!familyId) {
    const categories = await repo.find({ where: { isGlobal: true }, order: { name: "ASC" } });
    return NextResponse.json({ categories });
  }

  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const categories = await repo.find({
    where: [{ isGlobal: true }, { familyId }],
    order: { name: "ASC" },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { familyId, name } = await req.json();
  if (!familyId || !name) return NextResponse.json({ error: apiT(req, "api.categoryFamilyIdNameRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const repo = db.getRepository(Category);
  const normalized = String(name).trim();
  const existing = await repo.findOne({ where: [{ familyId, name: normalized }, { isGlobal: true, name: normalized }] });
  if (existing) return NextResponse.json({ category: existing });

  const category = await repo.save(repo.create({ name: normalized, familyId, isGlobal: false }));
  return NextResponse.json({ category }, { status: 201 });
}
