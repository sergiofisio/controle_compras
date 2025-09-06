import { NextResponse, NextRequest } from "next/server";
import * as itemService from "@/backend/services/itemService";
import { getCurrentUser } from "@/lib/session";
import { ZodError } from "zod";

type RouteContext = { params: { id: string } };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    const item = await itemService.findItemById(params.id, user.id);
    return NextResponse.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro.";
    return NextResponse.json({ message }, { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    const body = await request.json();
    const updatedItem = await itemService.editItem(params.id, body, user.id);
    return NextResponse.json(updatedItem);
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
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Não foi possível atualizar o item." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    await itemService.removeItem(params.id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro.";
    return NextResponse.json({ message }, { status: 404 });
  }
}
