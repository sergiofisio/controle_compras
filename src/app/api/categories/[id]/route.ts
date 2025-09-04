import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/backend/services/categoryService";
import { ZodError } from "zod";

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const category = await categoryService.findById(id);
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const updatedCategory = await categoryService.edit(id, body);
    return NextResponse.json(updatedCategory);
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
      { message: "Não foi possível atualizar a categoria." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    await categoryService.remove(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}
