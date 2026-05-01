import { In } from "typeorm";
import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Category } from "@/server/db/entities/catalog/Category";
import { apiT } from "@/i18n/api-translate";
import { translate } from "@/i18n/dictionaries";
import { langFromRequest } from "@/i18n/locale-from-request";

export const runtime = "nodejs";

const DEFAULT_GLOBAL_CATEGORY_KEYS = ["Alimentos", "Bebidas", "Limpeza", "Higiene", "__BEDDING__", "Farmacia", "Pet", "Outros"] as const;

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const repo = db.getRepository(Category);
  const globalCount = await repo.count({ where: { isGlobal: true } });
  if (globalCount === 0) {
    const lang = langFromRequest(req);
    const bedding = translate(lang, "api.catalogCategory.bedding");
    await repo.save(
      DEFAULT_GLOBAL_CATEGORY_KEYS.map((key) =>
        repo.create({ name: key === "__BEDDING__" ? bedding : key, isGlobal: true, familyId: null }),
      ),
    );
  }

  const categories = await repo.find({ where: [{ isGlobal: true }, { familyId }], order: { name: "ASC" } });
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
  const existing = await repo.findOne({ where: [{ name: normalized, isGlobal: true }, { name: normalized, familyId }] });
  if (existing) return NextResponse.json({ category: existing });

  const category = await repo.save(repo.create({ name: normalized, familyId, isGlobal: false }));
  return NextResponse.json({ category }, { status: 201 });
}
