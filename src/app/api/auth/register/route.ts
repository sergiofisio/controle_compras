import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDb } from "@/server/db/data-source";
import { User } from "@/server/db/entities/User";
import { Family } from "@/server/db/entities/Family";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { signSession } from "@/server/auth/jwt";
import { logAccess } from "@/server/logging/audit";
import { sessionCookieOptions } from "@/server/auth/cookies";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

function buildFamilyCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST(req: import("next/server").NextRequest) {
  const body = await req.json();
  const { name, email, password, familyName, familyCode } = body;
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!name || !email || !password) {
    return NextResponse.json({ error: apiT(req, "api.registerMissingFields") }, { status: 400 });
  }

  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const familyRepo = db.getRepository(Family);
  const memberRepo = db.getRepository(FamilyMember);

  const exists = await userRepo.findOne({ where: { email: normalizedEmail } });
  if (exists) return NextResponse.json({ error: apiT(req, "api.emailTaken") }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const isAdmin = normalizedEmail === String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const user = await userRepo.save(userRepo.create({ name, email: normalizedEmail, passwordHash, isAdmin, isActive: true }));

  let family: Family | null = null;
  let role: "owner" | "member" = "member";

  if (familyCode) {
    family = await familyRepo.findOne({ where: { inviteCode: String(familyCode).trim().toUpperCase() } });
    if (!family) {
      return NextResponse.json({ error: apiT(req, "api.invalidFamilyCode") }, { status: 400 });
    }
  } else {
    if (!familyName) return NextResponse.json({ error: apiT(req, "api.familyNameRequiredNoCode") }, { status: 400 });
    let code = buildFamilyCode();
    for (let i = 0; i < 5; i += 1) {
      const taken = await familyRepo.findOne({ where: { inviteCode: code } });
      if (!taken) break;
      code = buildFamilyCode();
    }
    family = await familyRepo.save(familyRepo.create({ name: String(familyName).trim(), inviteCode: code }));
    role = "owner";
  }

  await memberRepo.save(memberRepo.create({ familyId: family.id, userId: user.id, role }));

  const token = signSession({ userId: user.id, email: user.email, name: user.name });
  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }, familyId: family.id });
  response.cookies.set("session", token, sessionCookieOptions(60 * 60 * 8));

  await logAccess({
    action: "auth.register",
    userId: user.id,
    email: user.email,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    metadata: { familyId: family.id, role },
  });

  return response;
}
