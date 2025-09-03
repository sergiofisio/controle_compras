import { NextResponse } from "next/server";
import { markService } from "@/backend/services/markService";
import { ZodError } from "zod";

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const mark = await markService.findById(params.id);
    return NextResponse.json(mark);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const updatedMark = await markService.edit(params.id, body);
    return NextResponse.json(updatedMark);
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
      { message: "Não foi possível atualizar a marca." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await markService.remove(params.id);
    return new NextResponse(null, { status: 204 }); // Sucesso, sem conteúdo
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}
