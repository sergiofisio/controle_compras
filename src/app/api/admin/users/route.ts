import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDb } from "@/server/db/data-source";
import { requireAdmin } from "@/server/auth/admin";
import { User } from "@/server/db/entities/User";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Family } from "@/server/db/entities/Family";
import { logAccess } from "@/server/logging/audit";

export const runtime = "nodejs";

export async function POST(req: import("next/server").NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const { name, email, password, familyId } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Campos obrigatorios ausentes" }, { status: 400 });
  }
  const normalizedEmail = String(email).trim().toLowerCase();

  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const memberRepo = db.getRepository(FamilyMember);
  const familyRepo = db.getRepository(Family);

  const exists = await userRepo.findOne({ where: { email: normalizedEmail } });
  if (exists) return NextResponse.json({ error: "Email ja cadastrado" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const isAdmin = normalizedEmail === String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const user = await userRepo.save(userRepo.create({ name, email: normalizedEmail, passwordHash, isAdmin, isActive: true }));

  if (familyId) {
    const family = await familyRepo.findOne({ where: { id: familyId } });
    if (!family) {
      await userRepo.delete({ id: user.id });
      return NextResponse.json({ error: "Familia informada nao existe" }, { status: 400 });
    }

    const existsMembership = await memberRepo.findOne({ where: { familyId, userId: user.id } });
    if (!existsMembership) {
      await memberRepo.save(memberRepo.create({ familyId, userId: user.id, role: "member" }));
    }
  }

  await logAccess({
    action: "admin.user.create",
    userId: admin.user?.id,
    email: admin.user?.email,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    metadata: { createdUserId: user.id, familyId: familyId || null },
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
}
