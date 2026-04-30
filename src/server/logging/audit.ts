import { ensureDb } from "@/server/db/data-source";
import { AccessLog } from "@/server/db/entities/AccessLog";

export async function logAccess(input: {
  action: string;
  userId?: string | null;
  email?: string | null;
  ip?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  try {
    const db = await ensureDb();
    const repo = db.getRepository(AccessLog);
    await repo.save(
      repo.create({
        action: input.action,
        userId: input.userId ?? null,
        email: input.email ?? null,
        ip: input.ip ?? null,
        metadata: input.metadata ?? null,
      }),
    );
  } catch {
    // Nao interrompe fluxo principal por falha de auditoria
  }
}
