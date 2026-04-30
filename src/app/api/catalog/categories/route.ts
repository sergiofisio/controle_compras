import { In } from "typeorm";
import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Category } from "@/server/db/entities/catalog/Category";

export const runtime = "nodejs";

const DEFAULT_GLOBAL_CATEGORIES = [
  "Alimentos",
  "Bebidas",
  "Limpeza",
  "Higiene",
  "Cama, Mesa e Banho",
  "Farmacia",
  "Pet",
  "Outros",
];

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: "familyId obrigatorio" }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const repo = db.getRepository(Category);
  const globalCount = await repo.count({ where: { isGlobal: true } });
  if (globalCount === 0) {
    await repo.save(DEFAULT_GLOBAL_CATEGORIES.map((name) => repo.create({ name, isGlobal: true, familyId: null })));
  }

  const categories = await repo.find({ where: [{ isGlobal: true }, { familyId }], order: { name: "ASC" } });
  return NextResponse.json({ categories });
}

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { familyId, name } = await req.json();
  if (!familyId || !name) return NextResponse.json({ error: "familyId e nome obrigatorios" }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const repo = db.getRepository(Category);
  const normalized = String(name).trim();
  const existing = await repo.findOne({ where: [{ name: normalized, isGlobal: true }, { name: normalized, familyId }] });
  if (existing) return NextResponse.json({ category: existing });

  const category = await repo.save(repo.create({ name: normalized, familyId, isGlobal: false }));
  return NextResponse.json({ category }, { status: 201 });
}
