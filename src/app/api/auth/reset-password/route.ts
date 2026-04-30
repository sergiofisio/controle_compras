import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { IsNull, MoreThan } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { PasswordResetToken } from "@/server/db/entities/PasswordResetToken";
import { User } from "@/server/db/entities/User";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword || String(newPassword).length < 6) {
    return NextResponse.json({ error: "Token e nova senha valida sao obrigatorios" }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const db = await ensureDb();
  const tokenRepo = db.getRepository(PasswordResetToken);
  const userRepo = db.getRepository(User);

  const savedToken = await tokenRepo.findOne({
    where: { tokenHash, usedAt: IsNull(), expiresAt: MoreThan(new Date()) },
  });

  if (!savedToken) {
    return NextResponse.json({ error: "Token invalido ou expirado" }, { status: 400 });
  }

  const user = await userRepo.findOne({ where: { id: savedToken.userId } });
  if (!user) {
    return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepo.save(user);

  savedToken.usedAt = new Date();
  await tokenRepo.save(savedToken);

  return NextResponse.json({ message: "Senha atualizada com sucesso" });
}
