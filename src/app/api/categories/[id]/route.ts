import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/session";
import { edit, findById, remove } from "@/backend/services/categoryService";

export async function GET(_: Request, { params }: { params: any }) {
  try {
    const { id } = params;
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    const category = await findById(id, user.id);
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro.";
    return NextResponse.json({ message }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: any }) {
  try {
    const { id } = params;
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    const body = await request.json();
    const updatedCategory = await edit(id, body, user.id);
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

    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    await remove(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro.";
    return NextResponse.json({ message }, { status: 404 });
  }
}
