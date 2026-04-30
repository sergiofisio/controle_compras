import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Category } from "@/server/db/entities/Category";
import { ShoppingListItem } from "@/server/db/entities/ShoppingListItem";
import { PurchaseItem } from "@/server/db/entities/PurchaseItem";
import { Brand } from "@/server/db/entities/Brand";

export const runtime = "nodejs";

export async function DELETE(req: import("next/server").NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { id } = await ctx.params;
  const familyId = req.nextUrl.searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: "familyId obrigatorio" }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const categoryRepo = db.getRepository(Category);
  const category = await categoryRepo.findOne({ where: { id } });
  if (!category) return NextResponse.json({ error: "Secao nao encontrada" }, { status: 404 });
  if (category.isGlobal) return NextResponse.json({ error: "Nao e permitido remover secoes globais" }, { status: 400 });
  if (category.familyId !== familyId) return NextResponse.json({ error: "Secao nao pertence a familia ativa" }, { status: 403 });

  const [listUsage, purchaseUsage, brandUsage] = await Promise.all([
    db.getRepository(ShoppingListItem).count({ where: { categoryId: id } }),
    db.getRepository(PurchaseItem).count({ where: { categoryId: id } }),
    db.getRepository(Brand).count({ where: { categoryId: id } }),
  ]);

  if (listUsage > 0 || purchaseUsage > 0 || brandUsage > 0) {
    return NextResponse.json({ error: "Secao em uso. Remova/ajuste itens e marcas vinculados antes de excluir." }, { status: 409 });
  }

  await categoryRepo.delete({ id });
  return NextResponse.json({ ok: true });
}
