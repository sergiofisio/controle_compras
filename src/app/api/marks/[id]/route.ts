import { NextResponse, NextRequest } from "next/server";
import { markService } from "@/backend/services/markService";
import { ZodError } from "zod";

export async function GET(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = params;
    const mark = await markService.findById(id);
    return NextResponse.json(mark);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedMark = await markService.edit(id, body);
    return NextResponse.json(updatedMark);
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
      { message: "Não foi possível atualizar a marca." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = params;
    await markService.remove(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}
