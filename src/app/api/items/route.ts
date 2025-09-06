import { NextResponse } from "next/server";
import * as itemService from "@/backend/services/itemService";
import { getCurrentUser } from "@/lib/session";
import { ZodError } from "zod";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    const items = await itemService.listItems(user.id);
    return NextResponse.json(items);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    const body = await request.json();
    const newItem = await itemService.addItem(body, user.id);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos.", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes("já existe")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    const message =
      error instanceof Error ? error.message : "Não foi possível criar o item.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
