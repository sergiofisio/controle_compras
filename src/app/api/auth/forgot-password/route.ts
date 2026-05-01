import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";
import { MoreThan, IsNull } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { User } from "@/server/db/entities/User";
import { PasswordResetToken } from "@/server/db/entities/PasswordResetToken";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function POST(req: import("next/server").NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: apiT(req, "api.emailRequired") }, { status: 400 });
  }

  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const tokenRepo = db.getRepository(PasswordResetToken);
  const user = await userRepo.findOne({ where: { email } });

  // Nao revela se o e-mail existe
  if (!user) {
    return NextResponse.json({ message: apiT(req, "api.forgotPasswordMessage") });
  }

  // Invalida token ativo anterior
  const activeToken = await tokenRepo.findOne({ where: { userId: user.id, usedAt: IsNull(), expiresAt: MoreThan(new Date()) } });
  if (activeToken) {
    activeToken.usedAt = new Date();
    await tokenRepo.save(activeToken);
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await tokenRepo.save(tokenRepo.create({ userId: user.id, tokenHash, expiresAt, usedAt: null }));

  const url = new URL(req.url);
  const baseUrl = process.env.APP_URL || `${url.protocol}//${url.host}`;
  const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;

  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({
      message: apiT(req, "api.tokenGeneratedLocal"),
      resetLink,
      expiresAt: expiresAt.toISOString(),
    });
  }

  return NextResponse.json({ message: apiT(req, "api.forgotPasswordMessage") });
}
