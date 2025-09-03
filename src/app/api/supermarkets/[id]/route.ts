import { supermarketService } from "@/backend/services/supermarketService";
import { createApiHandlers } from "../../_helpers/routeHandlers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type RouteParams = { params: { id: string } };

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const supermarket = await supermarketService.findById(params.id);
    return NextResponse.json(supermarket);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const updatedSupermarket = await supermarketService.edit(params.id, body);
    return NextResponse.json(updatedSupermarket);
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
      { message: "Não foi possível atualizar o supermercado." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    await supermarketService.remove(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}
