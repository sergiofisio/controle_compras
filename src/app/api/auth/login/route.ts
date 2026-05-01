import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDb } from "@/server/db/data-source";
import { User } from "@/server/db/entities/User";
import { signSession } from "@/server/auth/jwt";
import { logAccess } from "@/server/logging/audit";
import { sessionCookieOptions } from "@/server/auth/cookies";
import { apiT } from "@/i18n/api-translate";

export async function POST(req: import("next/server").NextRequest) {
  const body = await req.json();
  const { email, password } = body;
  const normalizedEmail = String(email).trim().toLowerCase();

  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOne({ where: { email: normalizedEmail } });
  if (!user) return NextResponse.json({ error: apiT(req, "api.credentialsInvalid") }, { status: 401 });
  if (!user.isActive) return NextResponse.json({ error: apiT(req, "api.userInactive") }, { status: 403 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: apiT(req, "api.credentialsInvalid") }, { status: 401 });

  const token = signSession({ userId: user.id, email: user.email, name: user.name });
  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  response.cookies.set("session", token, sessionCookieOptions(60 * 60 * 8));
  await logAccess({
    action: "auth.login",
    userId: user.id,
    email: user.email,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
  });
  return response;
}
