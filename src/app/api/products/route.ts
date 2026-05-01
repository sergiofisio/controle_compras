import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { Product } from "@/server/db/entities/Product";
import { getSessionFromRequest } from "@/server/auth/session";
import { apiT } from "@/i18n/api-translate";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const db = await ensureDb();
  const products = await db.getRepository(Product).find();
  return NextResponse.json({ products });
}

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { name, category } = await req.json();
  const db = await ensureDb();
  const product = db.getRepository(Product).create({ name, category: category ?? null });
  await db.getRepository(Product).save(product);
  return NextResponse.json({ product }, { status: 201 });
}
