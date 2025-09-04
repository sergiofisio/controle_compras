import { NextResponse } from "next/server";
import { categoryService } from "@/backend/services/categoryService";
import { ZodError } from "zod";

export async function GET(_: Request, { params }: { params: any }) {
  try {
    const { id } = params;
    const category = await categoryService.findById(id);
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro.";
    return NextResponse.json({ message }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: any }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedCategory = await categoryService.edit(id, body);
    return NextResponse.json(updatedCategory);
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
      { message: "Não foi possível atualizar a categoria." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: any }) {
  try {
    const { id } = params;
    await categoryService.remove(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro.";
    return NextResponse.json({ message }, { status: 404 });
  }
}
