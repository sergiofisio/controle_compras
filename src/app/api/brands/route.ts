import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Brand } from "@/server/db/entities/Brand";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  const categoryId = req.nextUrl.searchParams.get("categoryId");
  if (!familyId) return NextResponse.json({ error: "familyId obrigatorio" }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const repo = db.getRepository(Brand);
  const brands = await repo.find({ where: [{ isGlobal: true }, { familyId }], order: { name: "ASC" } });
  const filtered = categoryId ? brands.filter((b) => !b.categoryId || b.categoryId === categoryId) : brands;

  return NextResponse.json({ brands: filtered });
}

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { familyId, name, categoryId } = await req.json();
  if (!familyId || !name) return NextResponse.json({ error: "familyId e nome obrigatorios" }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const repo = db.getRepository(Brand);
  const normalized = String(name).trim();
  const existing = await repo.findOne({ where: [{ familyId, name: normalized, categoryId: categoryId ?? null }, { isGlobal: true, name: normalized, categoryId: categoryId ?? null }] });
  if (existing) return NextResponse.json({ brand: existing });

  const brand = await repo.save(repo.create({ name: normalized, familyId, categoryId: categoryId ?? null, isGlobal: false }));
  return NextResponse.json({ brand }, { status: 201 });
}
