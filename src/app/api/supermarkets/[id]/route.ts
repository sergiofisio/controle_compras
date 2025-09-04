import { NextResponse, NextRequest } from "next/server";
import { supermarketService } from "@/backend/services/supermarketService";
import { ZodError } from "zod";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supermarket = await supermarketService.findById(id);
    return NextResponse.json(supermarket);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedSupermarket = await supermarketService.edit(id, body);
    return NextResponse.json(updatedSupermarket);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos.", details: error.flatten().fieldErrors },
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

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await supermarketService.remove(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}
