import {
  editItem,
  findItemById,
  removeItem,
} from "@/backend/services/itemService";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const item = await findItemById(params.id);
    return NextResponse.json(item);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const updatedItem = await editItem(params.id, body);
    return NextResponse.json(updatedItem);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos.",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    if (error.message.includes("já existe")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    if (error.message.includes("not found")) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Não foi possível atualizar o item." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await removeItem(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 404 });
  }
}
