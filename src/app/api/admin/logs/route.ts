import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { requireAdmin } from "@/server/auth/admin";
import { AccessLog } from "@/server/db/entities/AccessLog";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 100), 500);

  const db = await ensureDb();
  const logs = await db.getRepository(AccessLog).find({ order: { createdAt: "DESC" }, take: limit });
  return NextResponse.json({ logs });
}
