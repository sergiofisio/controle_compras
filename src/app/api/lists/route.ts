import { NextResponse } from "next/server";
import { In } from "typeorm";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { ShoppingList } from "@/server/db/entities/ShoppingList";
import { ShoppingListItem } from "@/server/db/entities/ShoppingListItem";
import { getIO } from "@/server/realtime/emitter";
import { apiT } from "@/i18n/api-translate";
import { translate } from "@/i18n/dictionaries";
import { langFromRequest } from "@/i18n/locale-from-request";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const familyId = req.nextUrl.searchParams.get("familyId");
  if (!familyId) return NextResponse.json({ error: apiT(req, "api.familyIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  const lists = await db.getRepository(ShoppingList).find({ where: { familyId } });
  const items = lists.length ? await db.getRepository(ShoppingListItem).find({ where: { listId: In(lists.map((l) => l.id)) } }) : [];
  const merged = lists.map((list) => ({ ...list, items: items.filter((item) => item.listId === list.id) }));

  return NextResponse.json({ lists: merged });
}

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { familyId, listId, listName, itemName, quantity, unit, categoryId, brandId } = await req.json();
  const db = await ensureDb();

  const member = await db.getRepository(FamilyMember).findOne({ where: { familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  let list: ShoppingList | null = null;

  if (listId) {
    list = await db.getRepository(ShoppingList).findOne({ where: { id: listId } });
    if (!list || list.familyId !== familyId) {
      return NextResponse.json({ error: apiT(req, "api.listNotFoundFamily") }, { status: 404 });
    }
  } else {
    if (!listName) return NextResponse.json({ error: apiT(req, "api.listNameRequired") }, { status: 400 });
    const normalizedListName = String(listName).trim();
    if (!normalizedListName) return NextResponse.json({ error: apiT(req, "api.listNameInvalid") }, { status: 400 });

    list = await db.getRepository(ShoppingList).findOne({ where: { familyId, name: normalizedListName } });
    if (!list) {
      list = await db.getRepository(ShoppingList).save(db.getRepository(ShoppingList).create({ familyId, name: normalizedListName }));
    }

    if (!itemName) {
      return NextResponse.json({ listId: list.id, list }, { status: 201 });
    }

    return NextResponse.json({ error: apiT(req, "api.createListFirst") }, { status: 400 });
  }

  if (!itemName) return NextResponse.json({ error: apiT(req, "api.itemNameRequired") }, { status: 400 });

  const unitFallback = translate(langFromRequest(req), "purchase.unitFallback");
  const item = await db
    .getRepository(ShoppingListItem)
    .save(
      db.getRepository(ShoppingListItem).create({
        listId: list.id,
        name: itemName,
        quantity: quantity ?? 1,
        unit: unit || unitFallback,
        categoryId: categoryId ?? null,
        brandId: brandId ?? null,
        checked: false,
      }),
    );

  getIO()?.to(list.id).emit("list-updated", { listId: list.id, action: "item_added", item });
  return NextResponse.json({ item, listId: list.id }, { status: 201 });
}

export async function DELETE(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { listId, itemId } = await req.json();
  if (!listId && !itemId) return NextResponse.json({ error: apiT(req, "api.listIdOrItemIdRequired") }, { status: 400 });

  const db = await ensureDb();
  const listRepo = db.getRepository(ShoppingList);
  const itemRepo = db.getRepository(ShoppingListItem);
  const memberRepo = db.getRepository(FamilyMember);

  if (itemId) {
    const item = await itemRepo.findOne({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: apiT(req, "api.itemNotFound") }, { status: 404 });

    const itemList = await listRepo.findOne({ where: { id: item.listId } });
    if (!itemList) return NextResponse.json({ error: apiT(req, "api.itemListNotFound") }, { status: 404 });

    const member = await memberRepo.findOne({ where: { familyId: itemList.familyId, userId: session.userId } });
    if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

    await itemRepo.delete({ id: item.id });
    getIO()?.to(itemList.id).emit("list-updated", { listId: itemList.id, action: "item_deleted", itemId: item.id });
    return NextResponse.json({ ok: true });
  }

  const list = await listRepo.findOne({ where: { id: listId } });
  if (!list) return NextResponse.json({ error: apiT(req, "api.listNotFound") }, { status: 404 });

  const member = await memberRepo.findOne({ where: { familyId: list.familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  await itemRepo.delete({ listId: list.id });
  await listRepo.delete({ id: list.id });

  getIO()?.to(list.id).emit("list-updated", { listId: list.id, action: "list_deleted" });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { itemId, checked } = await req.json();
  if (!itemId || typeof checked !== "boolean") {
    return NextResponse.json({ error: apiT(req, "api.itemIdCheckedRequired") }, { status: 400 });
  }

  const db = await ensureDb();
  const itemRepo = db.getRepository(ShoppingListItem);
  const listRepo = db.getRepository(ShoppingList);
  const memberRepo = db.getRepository(FamilyMember);

  const item = await itemRepo.findOne({ where: { id: itemId } });
  if (!item) return NextResponse.json({ error: apiT(req, "api.itemNotFound") }, { status: 404 });

  const list = await listRepo.findOne({ where: { id: item.listId } });
  if (!list) return NextResponse.json({ error: apiT(req, "api.listNotFound") }, { status: 404 });

  const member = await memberRepo.findOne({ where: { familyId: list.familyId, userId: session.userId } });
  if (!member) return NextResponse.json({ error: apiT(req, "api.accessDenied") }, { status: 403 });

  item.checked = checked;
  const updated = await itemRepo.save(item);

  getIO()?.to(list.id).emit("list-updated", { listId: list.id, action: "item_checked", item: updated });
  return NextResponse.json({ item: updated });
}
